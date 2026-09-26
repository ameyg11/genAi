import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

export async function generateText({ model, input }){
    const start= Date.now();
    const interaction = await ai.interactions.create({
        model,
        input,
    });

    const latencyMs = Date.now() - start;

    return{
        text: interaction.output_text,
        provider: "gemini",
        model,
        usage: {
            inputTokens: interaction.usage?.total_input_tokens,
            outputTokens: interaction.usage?.total_output_tokens,
            totalTokens: interaction.usage?.total_tokens,
        },
        latencyMs,
        requestId: interaction.id,
    }
}