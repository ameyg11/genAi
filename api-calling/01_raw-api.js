import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({               // class in @google/genai package which is used to create an instance of the GoogleGenAI class. This class provides methods for interacting with the Google Generative AI API.
  apiKey: process.env.GOOGLE_API_KEY,  
});

async function run(prompt) {
  const result = await ai.interactions.create({
    model: "gemini-3.5-flash",

    input: prompt,

    system_instruction:
      "Give me suggestions practically with lastest geopolitica conditions",

    generation_config: {
      temperature: 1,
    },

    // stream: true,

    tools: [
      {
        type: "google_search",
      },
    ],
  });

  console.log(result.output_text);

  return result.output_text;
}

run("What is current nifty level and what is the future prediction of nifty in next 3 months?");
