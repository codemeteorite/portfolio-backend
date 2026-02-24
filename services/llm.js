import { GoogleGenAI } from "@google/genai";
import { portfolioContext } from "../data/portfolioContext.js";

export async function generateReply(userMessage) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from environment.");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `
${portfolioContext}

User Question:
${userMessage}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });

  return (
    response.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No response from model."
  );
}
