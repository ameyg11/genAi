import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function run() {
  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash",

    input: "What are the latest features announced for Gemini in 2026?",

    tools: [
      {
        type: "google_search",
      },
    ],
  });

  console.log(interaction.output_text);
}

run();