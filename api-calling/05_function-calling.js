import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});


// -------------------------------------
// 1. OUR ACTUAL JAVASCRIPT FUNCTION
// -------------------------------------

function calculate(operation, a, b) {
  switch (operation) {
    case "add":
      return a + b;

    case "subtract":
      return a - b;

    case "multiply":
      return a * b;

    case "divide":
      return b !== 0 ? a / b : "Cannot divide by zero";

    default:
      return "Unknown operation";
  }
}


// -------------------------------------
// 2. DESCRIBE THE FUNCTION TO GEMINI
// -------------------------------------

const calculateTool = {
  type: "function",

  name: "calculate",

  description:
    "Performs basic arithmetic operations on two numbers.",

  parameters: {
    type: "object",

    properties: {
      operation: {
        type: "string",
        description:
          "The operation to perform: add, subtract, multiply, or divide.",
      },

      a: {
        type: "number",
        description: "The first number.",
      },

      b: {
        type: "number",
        description: "The second number.",
      },
    },

    required: ["operation", "a", "b"],
  },
};

const scheduleMeetingFunction = {
  type: 'function',
  name: 'schedule_meeting',
  description: 'Schedules a meeting with specified attendees at a given time and date.',
  parameters: {
    type: 'object',
    properties: {
      attendees: { type: 'array', items: { type: 'string' } },
      date: { type: 'string', description: 'Date (e.g., "2024-07-29")' },
      time: { type: 'string', description: 'Time (e.g., "15:00")' },
      topic: { type: 'string', description: 'The meeting topic.' },
    },
    required: ['attendees', 'date', 'time', 'topic'],
  },
};

// -------------------------------------
// 3. ASK GEMINI
// -------------------------------------

async function run() {
  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash",

    input: "What is 25 multiplied by 12?",
    
    tools: [calculateTool],
  });


  // -------------------------------------
  // 4. CHECK WHAT GEMINI WANTS TO DO
  // -------------------------------------

  for (const step of interaction.steps ?? []) {

    if (step.type === "function_call") {

      console.log("Function requested:");
      console.log(step.name);

      console.log("Arguments:");
      console.log(step.arguments);


      // -------------------------------------
      // 5. WE EXECUTE OUR REAL FUNCTION
      // -------------------------------------

      const result = calculate(
        step.arguments.operation,
        step.arguments.a,
        step.arguments.b
      );

      console.log("Function result:", result);


      // -------------------------------------
      // 6. SEND RESULT BACK TO GEMINI
      // -------------------------------------

      const finalInteraction = await ai.interactions.create({
        model: "gemini-3.5-flash",
        systemInstruction:
        "You are a helpful teacher. Explain using first principles after solving.",
        previous_interaction_id: interaction.id,

        tools: [calculateTool],

        input: [
          {
            type: "function_result",

            name: step.name,

            call_id: step.id,

            result: [
              {
                type: "text",
                text: String(result),
              },
            ],
          },
        ],
      });

      console.log("\nFinal answer:");
      console.log(finalInteraction.output_text);
    }
  }
}

run();