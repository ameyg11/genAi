import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const getWeatherFunction = {
  type: "function",
  name: "get_weather",
  description: "Fetches the current weather for a specified location.",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The location for which to fetch the weather.",
      },
    },

    required: ["location"],
  },
};

const getOrderFunction = {
  type: "function",
  name: "get_order",
  description: "Fetches the status of an order by its ID.",
  parameters: {
    type: "object",
    properties: {
      orderId: { type: "string", description: "The ID of the order to fetch." },
    },
    required: ["orderId"],
  },
};

const getNewsFunction = {
  type: "function",
  name: "get_news",
  description: "Fetches the latest news about a specified topic.",
  parameters: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "The topic for which to fetch news.",
      },
    },

    required: ["topic"],
  },
};

const refundOrderFunction = {
  type: "function",
  name: "refund_order",
  description: "Processes a refund for a specified order.",
  parameters: {
    type: "object",
    properties: {
      orderId: {
        type: "string",
        description: "The ID of the order to refund.",
      },
    },

    required: ["orderId"],
  },
};

function getWeather(location) {
  return `The weather in ${location} is sunny with a high of 25°C.`;
}

function getOrder(orderId) {
  return `Order ${orderId} is confirmed and will be delivered tomorrow.`;
}

function getNews(topic) {
  return `Here are the latest news articles about ${topic}.`;
}

function refundOrder(orderId) {
  return `Order ${orderId} has been refunded successfully.`;
}

const interaction = await client.interactions.create({
  model: "gemini-3.6-flash",
  input: "Get the weather for New York City, check the status of order 12345, fetch news about AI.",
  tools: [
    getWeatherFunction,
    getOrderFunction,
    getNewsFunction,
    refundOrderFunction,
  ],
});

console.log(`Initial response from Gemini: ${interaction.output_text}`);

const functionResults = [];

for (const step of interaction.steps ?? []) {
  if (step.type !== "function_call") {
    continue;
  }

  console.log(`Function to call: ${step.name}`);
  console.log(`Arguments: ${JSON.stringify(step.arguments)}`);

  let result;

  switch (step.name) {
    case "get_weather":
      result = getWeather(step.arguments.location);
      break;

    case "get_order":
      result = getOrder(step.arguments.orderId);
      break;

    case "get_news":
      result = getNews(step.arguments.topic);
      break;

    case "refund_order":
      result = refundOrder(step.arguments.orderId);
      break;

    default:
      result = `Unknown function: ${step.name}`;
  }

  console.log(`Result: ${result}`);

  functionResults.push({
    type: "function_result",
    name: step.name,
    call_id: step.id,
    result: [
      {
        type: "text",
        text: JSON.stringify(result),
      },
    ],
  });
}

// Send ALL function results back to Gemini at once
if (functionResults.length > 0) {

  const finalInteraction = await client.interactions.create({
    model: "gemini-3.6-flash",

    previous_interaction_id: interaction.id,

    tools: [
      getWeatherFunction,
      getOrderFunction,
      getNewsFunction,
      refundOrderFunction,
    ],

    input: functionResults,
  });

  console.log("\nFinal response from Gemini:");
  console.log(finalInteraction.output_text);
}
