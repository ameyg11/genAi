import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();    

async function main() {

    const ai = new GoogleGenAI({
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: 'What is the meaning of life?',
    });

    console.log(response.embeddings);
    console.log(response);
}

main();