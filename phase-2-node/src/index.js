import "dotenv/config";
import { fetchLatestArticle, publishUpdatedArticle } from "./services/laravelAPI.js";
import { searchGoogle } from "./services/googleSearch.js";
import { filterArticleLinks } from "./utils/filterUrls.js";
import { scrapeArticle } from "./services/scraper.js";
import { rewriteArticle } from "./services/llm.js";

export async function updateArticles() {
  try {
    const article = await fetchLatestArticle();

    if (!article) {
      throw new Error("No article found");
    }

    console.log("Fetched article:", article.title);

    const searchResults = await searchGoogle(article.title);
    // Get more links as backup in case some fail
    const links = filterArticleLinks(searchResults, "beyondchats.com", 5);

    if (links.length < 2) {
      throw new Error("Insufficient reference articles found");
    }

    // Scrape articles with error handling - try multiple links until we get 2 successful ones
    const refContents = [];
    const successfulLinks = [];
    
    for (const link of links) {
      if (refContents.length >= 2) break;
      
      try {
        console.log(`Scraping: ${link.link}`);
        const content = await scrapeArticle(link.link);
        
        if (content && content.length > 100) {
          refContents.push(content);
          successfulLinks.push(link);
          console.log(`Successfully scraped: ${link.link}`);
        } else {
          console.warn(`Insufficient content from: ${link.link}`);
        }
        
        // Add delay between requests to avoid rate limiting
        if (refContents.length < 2 && links.indexOf(link) < links.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.warn(`Failed to scrape ${link.link}:`, error.message);
        // Continue to next link
        continue;
      }
    }

    if (refContents.length < 2) {
      throw new Error(`Could only scrape ${refContents.length} out of ${links.length} articles. Need at least 2 successful scrapes.`);
    }

    // Use first 2 successful scrapes
    const updatedContent = await rewriteArticle(
      article.content,
      refContents[0],
      refContents[1]
    );

    const finalArticle = {
      title: article.title + " (Updated)",
      slug: article.slug + "-updated",
      content: `${updatedContent}

---

## References
1. ${successfulLinks[0].link}
2. ${successfulLinks[1].link}
`,
      version: "updated",
      references: successfulLinks.map(l => l.link)
    };

    const publishedArticle = await publishUpdatedArticle(finalArticle);

    console.log("Updated article published", publishedArticle);

    return {
      originalArticle: {
        id: article.id,
        title: article.title,
        slug: article.slug
      },
      updatedArticle: finalArticle,
      references: successfulLinks.map(l => l.link),
      scrapedCount: refContents.length,
      totalLinksAttempted: links.length
    };
  } catch (error) {
    console.error("Error in updateArticles:", error);
    throw error;
  }
}

// Allow running directly for testing: node src/index.js
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || 
    process.argv[1]?.includes('index.js')) {
  updateArticles()
    .then(() => {
      console.log("Process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Process failed:", error);
      process.exit(1);
    });
}
