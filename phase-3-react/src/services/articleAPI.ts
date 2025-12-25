import axios from "axios";
import type { Article } from "@/types/article";

interface ApiResponse {
  data: Article[];
}

interface UpdateResponse {
  data: {
    originalArticle: Article;
    updatedArticle: Article;
  };
}

export const fetchArticles = async (): Promise<Article[]> => {
  try {
    const response = await axios.get<ApiResponse>(
      `${import.meta.env.VITE_LARAVEL_API_BASE}/articles`
    );
    console.log("response", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
};

export const updateArticles = async (): Promise<UpdateResponse> => {
  try {
    const response = await axios.post<UpdateResponse>(
      `${import.meta.env.VITE_NODE_API_BASE}/initiate_update`
    );
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
};

