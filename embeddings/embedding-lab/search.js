import "dotenv/config";
import fs from "node:fs/promises";

import { embedQuery } from "./embedding.js";
import { cosineSimilarity } from "./math.js";

// Accept a query from the terminal.
// The default allows you to run the script without arguments.
const query =
  process.argv.slice(2).join(" ") ||
  "I forgot my login details. How can I get back into my account?";

// Load previously generated document embeddings.
const index = JSON.parse(
  await fs.readFile("index.json", "utf8")
);

console.log(`\nQuery: ${query}`);

// Convert the query into a vector.
const queryVector = await embedQuery(query);

// Confirm that the query vector matches our stored dimensions.
if (queryVector.length !== index.dimensions) {
  throw new Error(
    "Query vector dimensions do not match the stored index."
  );
}

// Calculate cosine similarity for every document.
const ranked = index.documents.map(document => {
  const score = cosineSimilarity(
    queryVector,
    document.embedding
  );

  return {
    id: document.id,
    title: document.title,
    text: document.text,
    score
  };
});

// Highest cosine similarity first.
ranked.sort((a, b) => b.score - a.score);

// Return the three highest-ranked results.
const topResults = ranked.slice(0, 3);

console.log("\nTop semantic search results:");

topResults.forEach((result, index) => {
  console.log(`\n${index + 1}. ${result.title}`);
  console.log(`   ID: ${result.id}`);
  console.log(`   Score: ${result.score.toFixed(4)}`);
  console.log(`   Text: ${result.text}`);
});