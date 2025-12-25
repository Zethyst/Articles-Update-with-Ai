import "dotenv/config";
import express from "express";
import cors from "cors";
import { updateArticles } from "./src/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/initiate_update", async (req, res) => {
  try {
    const result = await updateArticles();
    res.status(200).json({
      success: true,
      message: "Article update process completed successfully",
      data: result
    });
  } catch (error) {
    console.error("Error in updateArticles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update articles",
      error: error.message
    });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

