import 'dotenv/config'
import { GoogleGenAI } from '@google/genai'

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

if (!apiKey) {
  console.warn('⚠️ Warning: GEMINI_API_KEY / GOOGLE_API_KEY is missing from .env')
}

export const ai = new GoogleGenAI({ apiKey })

export const EMBEDDING_MODEL = 'gemini-embedding-2'
export const EMBEDDING_DIMENSIONS = 768

/**
 * Generate a 768-dimensional vector embedding for a given text string using Gemini
 */
export async function createEmbedding(text) {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS
    }
  })

  const vector = response.embeddings?.[0]?.values

  if (!vector || vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Expected ${EMBEDDING_DIMENSIONS} dimensions, received ${vector?.length ?? 0}`)
  }

  return Array.from(vector)
}
