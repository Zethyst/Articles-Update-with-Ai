import { getJson } from "serpapi";

export async function searchGoogle(query) {
  return new Promise((resolve, reject) => {
    getJson({
      q: query,
      engine: "google",
      api_key: process.env.SERPAPI_KEY,
      num: 5
    }, (json) => {
      resolve(json.organic_results || []);
    });
  });
}
