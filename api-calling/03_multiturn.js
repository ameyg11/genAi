/**
 5. Multi-turn conversation

Right now:

run("How to make good tea?");

is basically a one-off interaction.

Suppose you say:

User: My name is Amey.
AI: Nice to meet you.

User: What's my name?
AI: Amey.

The second request needs context.

With the Interactions API, you can use:

previous_interaction_id

to continue a conversation. Google's current docs describe this as the recommended stateful approach for multi-turn interactions.

Conceptually:

Interaction 1
     ↓
ID = abc123

Interaction 2
previous_interaction_id = abc123
     ↓
Gemini knows the previous interaction

This is extremely important to understand before learning agents.
 */


import "dotenv/config";

import {GoogleGenAI} from "@google/genai";

const ai = new GoogleGenAI({ 
     apiKey: process.env.GOOGLE_API_KEY,  
});

async function run(prompt) {
     const interaction1 = await ai.interactions.create({
          model: "gemini-3.5-flash",
          input: prompt,
     });
     console.log("Response 1:", interaction1.output_text);

     const interaction2 = await ai.interactions.create({
          model: "gemini-3.5-flash",
          input: "What is my name?",
          previous_interaction_id: interaction1.id,
     });
     console.log("Response 2:", interaction2.output_text);
}

await run("Hey my name is Amey!")