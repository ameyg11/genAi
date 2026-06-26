import dotenv from "dotenv";
dotenv.config();

import { HuggingFaceInference } from "@langchain/community/llms/hf";

// const model = new HuggingFaceInference({
//   model: "deepseek-ai/DeepSeek-R1",
//   apiKey: process.env.HUGGINGFACEHUB_API_TOKEN,
// });

// const response = await model.invoke("What is AI?");
// console.log(response);

// import { initChatModel } from "langchain";

// const model = await initChatModel(
//   "mistralai:mistral-small-latest",
//   {
//     temperature: 0,
//     maxTokens: 5,
//   },
// );

// const response = await model.invoke("Why hugging face is best for AI?");
// console.log(response.content);

import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(
  process.env.HUGGINGFACEHUB_API_TOKEN
);

const chat = await client.chatCompletion({
  model: "meta-llama/Llama-3.1-8B-Instruct",
  messages: [
    {
      role: "user",
      content: "What is AI?"
    }
  ]
});

console.log(chat.choices[0].message.content);