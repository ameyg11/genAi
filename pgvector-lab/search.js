import { initDb, pool } from "./db.js";
import { embedText } from "./embed.js";

async function main() {
  const query = process.argv.slice(2).join(" ").trim();

  if (!query) {
    throw new Error('Usage: npm run search -- "your search query"');
  }

  await initDb();

  // 1. Embed the user's query for retrieval.
  const queryVector = await embedText(
    query,
    "RETRIEVAL_QUERY"
  );

  const result = await pool.query(
    `
    SELECT 
    id, 
    title, 
    content, 
    1 - (embedding <=> $1::vector)
     AS cosine_similarity
    FROM documents
    ORDER BY embedding <=> $1::vector
    LIMIT 3
    `,
    [JSON.stringify(queryVector)]
  )

  if(result.rows.length == 0){
    console.log("No documents found.");
    return;
  }

  for (const row of result.rows) {
    console.log("\n----------------------------");
    console.log(`Title: ${row.title}`);
    console.log(
      `Similarity: ${
        Number(row.cosine_similarity).toFixed(4)
      }`
    );
    console.log(`Content: ${row.content}`);
  }
}

main()
  .catch((error) => {
    console.error("Search failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());