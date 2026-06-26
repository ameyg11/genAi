import dotenv from "dotenv";
dotenv.config();

import { initChatModel } from "langchain";

// const model = await initChatModel("gpt-5-nano");
// const model = await initChatModel("google-genai:gemini-2.5-flash-lite");

// // console.log(model)

// const response = await model.invoke("What is cricket?");

// console.log(response);

// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// const model = new ChatGoogleGenerativeAI({
//     model: "gemini-2.5-flash-lite",
//     apiKey: process.env.GOOGLE_API_KEY,
//     temperature: 0,
// })

// const response = await model.invoke("What is difference between scoccer and football ?");

// console.log(response.content);

const model = await initChatModel(
  "mistralai:mistral-small-latest",
  {
    temperature: 0,
  }
);

const response = await model.invoke("What is AI?");
console.log(response.content);