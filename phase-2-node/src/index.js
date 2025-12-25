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
    const links = filterArticleLinks(searchResults, "beyondchats.com");

    if (links.length < 2) {
      throw new Error("Insufficient reference articles found");
    }

    const refContents = await Promise.all(
      links.map(l => scrapeArticle(l.link))
    );

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
1. ${links[0].link}
2. ${links[1].link}
`,
      version: "updated",
      references: links.map(l => l.link)
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
      references: links.map(l => l.link)
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
