import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const scheduleMeetingFunction = {
  type: "function",
  name: "schedule_metting",
  description:
    "Schedules a meeting with specified attendees at a given time and date.",
  parameters: {
    type: "object",
    properties: {
      attendees: { type: "array", items: { type: "string" } },
      date: { type: "string", description: 'Date (e.g., "2024-07-29")' },
      time: { type: "string", description: 'Time (e.g., "15:00")' },
      topic: { type: "string", description: "The meeting topic." },
    },
    required: ["attendees", "date", "time", "topic"],
  },
};

async function schedule_metting(attendees, date, time, topic) {
  return `Meeting scheduled with ${attendees.join(", ")} on ${date} at ${time} about ${topic}.`;
}

const interaction = await client.interactions.create({
  model: "gemini-3.6-flash",
  input:
    "Schedule a meeting with Bob and Alice for 03/27/2025 at 10:00 AM about Q3 planning.",
  tools: [scheduleMeetingFunction],
});

console.log(`Initial response from Gemini: ${interaction.output_text}`);
console.log(`Interactions : ${interaction}`);
console.log(`Steps: ${JSON.stringify(interaction.steps)}`);

for (const step of interaction.steps ?? []) {
  if (step.type === "function_call") {
    console.log(`Function to call: ${step.name}`);
    console.log(`Arguments: ${JSON.stringify(step.arguments)}`);

    const result = await schedule_metting(
      step.arguments.attendees,
      step.arguments.date,
      step.arguments.time,
      step.arguments.topic,
    );

    console.log(`Result: ${result}`);

    const finalInteraction = await client.interactions.create({
      model: "gemini-3.6-flash",
      input: result,
      previous_interaction_id: interaction.id,
    });
    console.log(`Final response from Gemini: ${finalInteraction.output_text}`);
  }
}

/**
 * USER
  │
  │ "Schedule a meeting"
  ▼
GEMINI
  │
  │ function_call
  │ name + arguments
  ▼
YOUR JAVASCRIPT
  │
  │ execute function
  ▼
YOUR FUNCTION
  │
  │ returns result
  ▼
YOUR JAVASCRIPT
  │
  │ function_result
  │ call_id + result
  ▼
GEMINI
  │
  │ final answer
  ▼
USER
 * 
 */