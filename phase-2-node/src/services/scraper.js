import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeArticle(url) {
  const { data } = await axios.get(url, { timeout: 10000 });
  const $ = cheerio.load(data);

  $("script, style, nav, footer, header").remove();

  const text = $("article").text() || $("body").text();

  return text.replace(/\s+/g, " ").trim().slice(0, 6000);
}
