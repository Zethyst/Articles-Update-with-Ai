import { getJson } from "serpapi";

export async function searchGoogle(query) {
  return new Promise((resolve, reject) => {
    getJson({
      q: query,
      engine: "google",
      api_key: process.env.SERPAPI_KEY,
      num: 10 // Get more results for backup links
    }, (json) => {
      if (json.error) {
        reject(new Error(json.error));
        return;
      }
      resolve(json.organic_results || []);
    });
  });
}
