import "dotenv/config";
import fs from "node:fs/promises";
import { embedDocument, MODEL, DIMENSIONS } from "./embedding.js";

// Read our original document collection.
const documents = JSON.parse(await fs.readFile("documents.json", "utf8"));

const indexedDocuments = [];

for (const document of documents) {
  console.log(`Embedding: ${document.title}`);

  // Ask Gemini to convert the document to a vector.
  const embedding = await embedDocument(document);

  // Keep the original content and its embedding together.
  indexedDocuments.push({
    ...document,
    embedding
  });
}

// Save the generated data locally.
// We don't need to pay to regenerate every vector
// whenever we start a search.

const index = {
    model: MODEL,
    dimensions: DIMENSIONS,
    documents: indexedDocuments
};

await fs.writeFile(
    "index.json",
    JSON.stringify(index),
    "utf8"
)

console.log(
  `Saved ${indexedDocuments.length} documents to index.json`
);