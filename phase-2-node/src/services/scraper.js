import axios from "axios";
import * as cheerio from "cheerio";

// Random user agents to rotate
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15"
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data } = await axios.get(url, {
        timeout: 15000,
        headers: {
          "User-Agent": getRandomUserAgent(),
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "DNT": "1",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Cache-Control": "max-age=0"
        },
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400
      });

      const $ = cheerio.load(data);

      // Remove unwanted elements
      $("script, style, nav, footer, header, aside, .advertisement, .ads, [class*='ad-'], [id*='ad-']").remove();

      // Try to find article content
      let text = $("article").text() || 
                 $("main").text() || 
                 $("[role='main']").text() ||
                 $(".content, .post-content, .article-content").text() ||
                 $("body").text();

      if (!text || text.trim().length < 100) {
        throw new Error("Insufficient content extracted");
      }

      return text.replace(/\s+/g, " ").trim().slice(0, 6000);
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      
      if (error.response?.status === 403 || error.response?.status === 429) {
        console.warn(`Attempt ${attempt}/${maxRetries} failed for ${url}: ${error.response?.status}`);
        if (!isLastAttempt) {
          // Exponential backoff: 2s, 4s, 8s
          const delayMs = Math.pow(2, attempt) * 1000;
          await delay(delayMs);
          continue;
        }
      }
      
      if (isLastAttempt) {
        throw new Error(`Failed to scrape ${url} after ${maxRetries} attempts: ${error.message}`);
      }
      
      // For other errors, wait a bit before retrying
      await delay(1000 * attempt);
    }
  }
}

export async function scrapeArticle(url) {
  try {
    return await scrapeWithRetry(url);
  } catch (error) {
    console.error(`Scraping failed for ${url}:`, error.message);
    throw error;
  }
}
