import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({
  apiKey,
});

export const DIMENSIONS = 768;

export async function embedText(text, taskType, title) {
  const config = {
    taskType,
    outputDimensionality: DIMENSIONS,
  };

  if (title && taskType === "RETRIEVAL_DOCUMENT") {
    config.title = title;
  }

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config,
  });

  const vector = response.embeddings?.[0].values;

  if (!vector || vector.length != DIMENSIONS) {
    throw new Errorr(
      `Expected ${DIMENSIONS} dimensions, received ${vector?.length ?? 0}`,
    );
  }

  return vector;
}
