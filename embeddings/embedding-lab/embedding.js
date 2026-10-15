import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

// const apiKey = process.env.GEMINI_API_KEY;

// if (!apiKey) {
//   throw new Error("GEMINI_API_KEY is missing from .env");
// }

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const MODEL = "gemini-embedding-2";

// Start with 768 dimensions to keep vectors smaller.
export const DIMENSIONS = 768;

// Embed a stored document.
export async function embedDocument(document) {
  const formattedText =
    `title: ${document.title ?? "none"} | text: ${document.text}`;

  return embedText(formattedText);
}

// Embed a user's search query.
export async function embedQuery(query) {
  const formattedQuery =
    `task: search result | query: ${query}`;

  return embedText(formattedQuery);
}

// Shared implementation of the API call.
async function embedText(text) {
  const response = await ai.models.embedContent({
    model: MODEL,
    contents: text,
    config: {
      outputDimensionality: DIMENSIONS
    }
  });

  const values = response.embeddings?.[0]?.values;

  if (!values || values.length !== DIMENSIONS) {
    throw new Error("Gemini returned an unexpected embedding.");
  }
  console.log(values)
  return Array.from(values);
}

// embedText("I forgot password");