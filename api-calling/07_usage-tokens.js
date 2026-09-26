import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const prompt = "Explain recursion using first principles.";

const interaction = await ai.models.countTokens({
  model: "gemini-3.8-flash",
  contents: prompt,
});

console.log("Input tokens:", interaction.totalTokens);

if (interaction.usage) {
  console.log("Input:", interaction.usage.total_input_tokens);

  console.log("Output:", interaction.usage.total_output_tokens);

  console.log("Thoughts:", interaction.usage.total_thought_tokens);

  console.log("Total:", interaction.usage.total_tokens);
} else {
  console.log(
    "Detailed usage breakdown is not available for this API response.",
  );
  console.log("Response object:", interaction);
}
