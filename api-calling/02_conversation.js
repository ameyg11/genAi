// this is multi turn system only 

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function run() {
  const chat = ai.chats.create({
    model: "gemini-3.5-flash",

    config: {
      systemInstruction:
        "You are a helpful teacher. Explain using first principles.",
      temperature: 0.7,
    },
  });

  const response1 = await chat.sendMessage({
    message: "My name is Amey.",
  });

  console.log("AI 1:", response1.text);

  const response2 = await chat.sendMessage({
    message: "What is my name?",
  });

  console.log("AI 2:", response2.text);

  const response3 = await chat.sendMessage({
    message: "What did I tell you about myself?",
  });

  console.log("AI 3:", response3.text);
}

run();