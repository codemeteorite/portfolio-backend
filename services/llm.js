// services/llm.js

import { GoogleGenAI } from "@google/genai";
import { portfolioContext } from "../data/portfolioContext.js";

// Simple in-memory cache to save on API calls
const cache = new Map();

export async function generateReply(userMessage) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment.");
  }

  // Check cache first
  const normalizedMessage = userMessage.trim().toLowerCase();
  if (cache.has(normalizedMessage)) {
    console.log("Serving from cache:", normalizedMessage);
    return cache.get(normalizedMessage);
  }

  const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

  const prompt = `
${portfolioContext}

User Question:
${userMessage}
`;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

<<<<<<< HEAD
  return (
    response.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No response from model."
  );
}
=======
    // Store in cache
    cache.set(normalizedMessage, text);

    return text;
  } catch (error) {
    if (error.status === 429 || error.message?.includes("429")) {
      console.error("Gemini Quota Exceeded:", error);
      return "My Working Hours are done. I'll be back Tomorrow 😴";
    }
    throw error;
  }
}
>>>>>>> 31621b1 (feat: implement trust proxy, quota-aware rate limiting, and in-memory caching for Gemini)
