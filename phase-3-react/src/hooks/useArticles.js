import { useState, useEffect, useCallback } from "react";
import { fetchArticles, updateArticles } from "@/services/articleAPI";
import toast from "react-hot-toast";

const STORAGE_KEY = "original_articles";

export const useArticles = () => {
  const [originalArticles, setOriginalArticles] = useState([]);
  const [updatedArticles, setUpdatedArticles] = useState([]);
  const [isLoadingOriginal, setIsLoadingOriginal] = useState(true);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [hasUpdated, setHasUpdated] = useState(false);

  // Fetch and store original articles on mount
  useEffect(() => {
    const loadOriginalArticles = async () => {
      // Check localStorage first
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (stored) {
        setOriginalArticles(JSON.parse(stored));
        setIsLoadingOriginal(false);
        // toast.success("Articles Loaded: Original articles retrieved from localStorage.");
        return;
      }

      // Fetch from API if not in localStorage
      try {
        const articles = await fetchArticles();
        console.log("articles",articles);
        setOriginalArticles(articles);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
        // toast.success("Articles Fetched: Original articles fetched from Laravel API and stored.");
      } catch (error) {
        toast.error("Error: Failed to fetch articles from API.");
      } finally {
        setIsLoadingOriginal(false);
      }
    };

    loadOriginalArticles();
  }, []);

  // Transform API response to Article format
  const transformUpdatedArticle = (apiResponse) => {
    if (!apiResponse?.data?.updatedArticle) {
      return [];
    }

    const { originalArticle, updatedArticle } = apiResponse.data;
    
    // Extract excerpt from content (first paragraph or first 200 characters)
    const getExcerpt = (content) => {
      if (!content) return "";
      // Try to get first paragraph
      const firstParagraph = content.split("\n\n")[0];
      if (firstParagraph && firstParagraph.length > 50) {
        return firstParagraph.substring(0, 200).trim() + "...";
      }
      // Fallback to first 200 characters
      return content.substring(0, 200).trim() + (content.length > 200 ? "..." : "");
    };

    // Calculate read time based on content length (average reading speed: 200 words/min)
    const calculateReadTime = (content) => {
      if (!content) return "5 min read";
      const wordCount = content.split(/\s+/).length;
      const minutes = Math.ceil(wordCount / 200);
      return `${minutes} min read`;
    };

    const currentDate = new Date().toISOString();
    const currentDateShort = currentDate.split("T")[0];
    
    const transformedArticle = {
      id: originalArticle?.id || Date.now(),
      title: updatedArticle.title || "",
      excerpt: getExcerpt(updatedArticle.content),
      content: updatedArticle.content || "",
      author: "AI Assistant", // Default since not in API response
      date: currentDateShort,
      published_at: currentDate,
      category: "Updated", // Default category
      readTime: calculateReadTime(updatedArticle.content),
      slug: updatedArticle.slug || "",
      version: updatedArticle.version || "updated",
      references: updatedArticle.references || [],
    };

    // Return as array since component expects Article[]
    return [transformedArticle];
  };

  // Handle update action
  const handleUpdate = useCallback(async () => {
    setIsLoadingUpdate(true);
    
    try {
      const response = await updateArticles();
      console.log("Update response:", response);
      
      // Transform the API response to match Article interface
      const transformedArticles = transformUpdatedArticle(response);
      
      if (transformedArticles.length === 0) {
        throw new Error("No updated article found in response");
      }
      
      setUpdatedArticles(transformedArticles);
      setHasUpdated(true);
      toast.success("Articles Updated: New Node.js articles received successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Update Failed: Could not fetch updated articles.");
    } finally {
      setIsLoadingUpdate(false);
    }
  }, []);

  return {
    originalArticles,
    updatedArticles,
    isLoadingOriginal,
    isLoadingUpdate,
    hasUpdated,
    handleUpdate,
  };
};
