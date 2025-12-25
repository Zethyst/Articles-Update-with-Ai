import axios from "axios";

export const fetchArticles = async () => {
  try {
  const response = await axios.get(`${import.meta.env.VITE_LARAVEL_API_BASE}/articles`);
    console.log("response",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
};

export const updateArticles = async () => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_NODE_API_BASE}/initiate_update`);
      console.log("response",response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
};
