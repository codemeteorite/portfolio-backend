// services/llm.js

import Groq from "groq-sdk";
import { portfolioContext } from "../data/portfolioContext.js";

// Simple in-memory cache to save on API calls
const cache = new Map();

export async function generateReply(userMessage) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing from environment.");
  }

  // Check cache first
  const normalizedMessage = userMessage.trim().toLowerCase();
  if (cache.has(normalizedMessage)) {
    console.log("Serving from cache:", normalizedMessage);
    return cache.get(normalizedMessage);
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: portfolioContext
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const text = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    // Store in cache
    cache.set(normalizedMessage, text);

    return text;
  } catch (error) {
    // Groq rate limit/quota error is often 429
    if (error.status === 429 || error.message?.includes("429")) {
      console.error("Groq Quota Exceeded:", error);
      return "My Working Hours are done. I'll be back Tomorrow 😴";
    }
    console.error("Groq Error:", error);
    throw error;
  }
}
