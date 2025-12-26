import "dotenv/config";
import express from "express";
import cors from "cors";
import { updateArticles } from "./src/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000);
  next();
});

app.post("/initiate_update", async (req, res) => {
  const startTime = Date.now();
  
  try {
    const result = await updateArticles();
    const duration = Date.now() - startTime;
    
    res.status(200).json({
      success: true,
      message: "Article update process completed successfully",
      data: result,
      duration: `${Math.round(duration / 1000)}s`
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Error in updateArticles:", error);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message?.includes("No article found")) {
      statusCode = 404;
    } else if (error.message?.includes("Insufficient")) {
      statusCode = 422;
    } else if (error.response?.status) {
      statusCode = error.response.status;
    }
    
    res.status(statusCode).json({
      success: false,
      message: "Failed to update articles",
      error: error.message,
      duration: `${Math.round(duration / 1000)}s`
    });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

