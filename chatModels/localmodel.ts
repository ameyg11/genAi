// import { pipeline } from "@huggingface/transformers";

// async function main() {
//   const generator = await pipeline(
//     "text-generation",
//     "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
//   );

//   const result = await generator("Explain transformers in one sentence.");
//   console.log(result);
// }

// main().catch(console.error);

import ollama from "ollama";

const response = await ollama.chat({
  model: "tinyllama",
  messages: [
    {
      role: "user",
      content: "Explain transformers."
    }
  ]
});

console.log(response.message.content);



// ``` 
// javascript
// /*
// ====================================================
// GEN AI - HOW MY CODE TALKS TO A LOCAL LLM
// ====================================================

// FIRST PRINCIPLE

// A Language Model (LLM) is NOT a JavaScript program.
// It is a collection of billions of learned numbers (weights).

// Example:
// model.safetensors
// config.json
// tokenizer.json

// JavaScript cannot execute these files directly.

// ----------------------------------------------------
// WHO DOES WHAT?
// ----------------------------------------------------

// User
//   ↓
// My JavaScript Code
//   ↓
// Ollama Client (npm package)
//   ↓
// HTTP Request (localhost:11434)
//   ↓
// Ollama Server (Runtime)
//   ↓
// Loads TinyLlama into RAM
//   ↓
// Tokenizer converts text → tokens
//   ↓
// TinyLlama predicts next tokens
//   ↓
// Tokenizer converts tokens → text
//   ↓
// Ollama sends response
//   ↓
// My JavaScript receives response

// ----------------------------------------------------
// MODEL vs OLLAMA
// ----------------------------------------------------

// TinyLlama
// ---------
// ✔ The Brain
// ✔ Neural Network
// ✔ Learns patterns
// ✔ Cannot run itself

// Ollama
// -------
// ✔ Model Manager
// ✔ Downloads models
// ✔ Loads models into memory
// ✔ Runs inference
// ✔ Exposes HTTP API

// Think of it like:

// Movie File (.mp4)  = TinyLlama
// VLC Media Player   = Ollama

// The movie cannot play itself.

// ----------------------------------------------------
// WHAT HAPPENS WHEN I ASK A QUESTION?
// ----------------------------------------------------

// Question

// "What is AI?"

// ↓

// Ollama Client

// ↓

// POST http://localhost:11434/api/chat

// ↓

// Ollama Server

// ↓

// TinyLlama

// ↓

// Answer

// ----------------------------------------------------
// WHY DO WE INSTALL THE OLLAMA NPM PACKAGE?
// ----------------------------------------------------

// Because writing HTTP requests manually is tedious.

// Instead of:

// fetch(...)
// POST /api/chat

// we simply write:

// ollama.chat(...)

// The package is just a convenient wrapper around the HTTP API.

// ----------------------------------------------------
// MINIMUM CODE
// ----------------------------------------------------
// */

// import ollama from "ollama";

// const response = await ollama.chat({
//   model: "tinyllama",
//   messages: [
//     {
//       role: "user",
//       content: "Explain JavaScript."
//     }
//   ]
// });

// console.log(response.message.content);

// /*
// ====================================================
// WHAT HAPPENS INTERNALLY
// ====================================================

// 1. My JS creates a request

// ↓

// 2. Ollama Client sends HTTP request

// ↓

// 3. Ollama Server receives it

// ↓

// 4. Server loads TinyLlama

// ↓

// 5. Prompt becomes tokens

// ↓

// 6. Neural Network predicts next tokens

// ↓

// 7. Tokens become English text

// ↓

// 8. Response returned as JSON

// ↓

// 9. console.log()

// ====================================================
// IMPORTANT NOTES
// ====================================================

// LLM = Brain

// Runtime = Executes the brain

// API = Way to communicate with runtime

// Node.js NEVER talks directly to TinyLlama.

// Node.js
//     ↓
// Ollama API
//     ↓
// Ollama Runtime
//     ↓
// TinyLlama

// ====================================================
// COMMANDS TO REMEMBER
// ====================================================

// # Download model
// ollama pull tinyllama

// # List downloaded models
// ollama list

// # Chat in terminal
// ollama run tinyllama

// # Start server
// ollama serve

// # Check API
// curl http://localhost:11434/api/tags

// ====================================================
// MENTAL MODEL
// ====================================================

// Question
//    ↓
// Tokenizer
//    ↓
// Tokens (Numbers)
//    ↓
// TinyLlama
//    ↓
// Predicted Tokens
//    ↓
// Tokenizer
//    ↓
// English Answer

// Everything an LLM does is just:
// TEXT → TOKENS → PREDICTION → TEXT

// ====================================================
// ```
