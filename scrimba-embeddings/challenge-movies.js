import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { createEmbedding } from './geminiClient.js'
import { supabase } from './supabaseClient.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runChallenge() {
  console.log('🚀 Starting Scrimba Challenge: Text Splitters, Embeddings & Supabase...\n')

  // ============================================================
  // Step 1: Use LangChain to split the content in movies.txt into smaller chunks
  // ============================================================
  console.log('--- Step 1: Chunking movies.txt with LangChain ---')
  const moviesPath = path.join(__dirname, 'movies.txt')
  const moviesRawText = fs.readFileSync(moviesPath, 'utf8')

  /*
   * Each movie description is roughly 300-600 characters.
   * Setting chunkSize around 350-500 with chunkOverlap ensures each movie
   * or key segment forms a coherent, focused chunk.
   * Splitting primarily on double newlines ('\n\n') keeps movie entries intact!
   */
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 450,
    chunkOverlap: 50,
    separators: ['\n\n', '\n', ' ', '']
  })

  const chunks = await splitter.splitText(moviesRawText)
  console.log(`✅ movies.txt split into ${chunks.length} chunks.\n`)

  // Preview first chunk
  console.log('Example chunk 1 preview:')
  console.log(`"${chunks[0].substring(0, 150)}..."\n`)

  // ============================================================
  // Step 2 & 3: Create Gemini Embedding for each chunk and insert into Supabase
  // ============================================================
  console.log('--- Step 2 & 3: Generating Gemini Embeddings & Inserting into Supabase ---')

  const rowsToInsert = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    process.stdout.write(`Embedding chunk ${i + 1}/${chunks.length}... `)

    try {
      // 2. Generate embedding vector using Gemini (768 dimensions)
      const embedding = await createEmbedding(chunk)
      process.stdout.write(`Done (vector length: ${embedding.length})\n`)

      rowsToInsert.push({
        content: chunk,
        embedding: embedding
      })
    } catch (err) {
      console.error(`\n❌ Failed to embed chunk ${i + 1}:`, err.message)
      throw err
    }
  }

  console.log(`\nInserting ${rowsToInsert.length} records into Supabase 'documents' table...`)

  // 3. Insert all chunks and embeddings into Supabase
  const { data, error } = await supabase
    .from('documents')
    .insert(rowsToInsert)
    .select('id')

  if (error) {
    console.error('❌ Supabase insertion failed:', error.message)
    console.log('\n💡 Tip: Did you create the table using 01_schema.sql in your Supabase SQL editor?')
    console.log('   Ensure the table has `embedding vector(768)`.')
  } else {
    console.log(`🎉 Success! Inserted ${data.length} movie document chunks into Supabase.`)
  }
}

runChallenge().catch(console.error)
