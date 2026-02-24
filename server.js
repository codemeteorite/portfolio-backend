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

// ==============================
// SECURITY HEADERS
// ==============================
app.use(helmet());

// ==============================
// LOGGING
// ==============================
app.use(morgan("dev"));

// ==============================
// CORS CONFIGURATION
// ==============================
const allowedOrigins = [
  "https://yahiya.xyz",
  "http://yahiya.xyz",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

// Handle preflight requests explicitly
app.options("*", cors());

// ==============================
// BODY PARSER
// ==============================
app.use(express.json({ limit: "10kb" }));

// ==============================
// RATE LIMITING
// ==============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Calm down."
  }
});

app.use("/chat", limiter);

// ==============================
// HEALTH CHECK
// ==============================
app.get("/", (req, res) => {
  res.status(200).send("AI Backend Running");
});

// ==============================
// CHAT ROUTE
// ==============================
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

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Chat error:", error.message);

    return res.status(500).json({
      error: "AI service unavailable."
    });
  }
});

// ==============================
// FALLBACK
// ==============================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

// ==============================
// START SERVER
// ==============================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
