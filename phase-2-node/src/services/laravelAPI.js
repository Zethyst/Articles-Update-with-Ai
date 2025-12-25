import axios from "axios";

const API = process.env.LARAVEL_API_BASE || "http://localhost:8000/api";

export async function fetchLatestArticle() {
  const res = await axios.get(`${API}/articles`);
  return res.data[0];
}

export async function publishUpdatedArticle(article) {
  const res = await axios.post(`${API}/articles`, article);
  return res.data;
}
