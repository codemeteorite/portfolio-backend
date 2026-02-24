// index.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { generateReply } from "./services/llm.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔒 Security Headers
app.use(helmet());

// 📊 Logging
app.use(morgan("dev"));

// 🌍 CORS (restrict later to your domain)
app.use(cors({
  origin: [
    "http://yahiya.xyz",
    "https://yahiya.xyz",
    "http://localhost:5500",
     "http://localhost:5500"
  ]
}));

// 📦 JSON Parsing
app.use(express.json({ limit: "10kb" }));

// 🚦 Rate Limiting (important)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // max 50 requests per IP per window
  message: {
    error: "Too many requests. Calm down."
  }
});

app.use("/chat", limiter);

// 🔍 Health Check
app.get("/", (req, res) => {
  res.status(200).send("AI Backend Running");
});

// 💬 Chat Endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Valid message string required."
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        error: "Message too long."
      });
    }

    const reply = await generateReply(message);

    res.json({ reply });

  } catch (error) {
    console.error("Chat error:", error.message);

    res.status(500).json({
      error: "AI service unavailable."
    });
  }
});

// 🛑 Fallback Route
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});