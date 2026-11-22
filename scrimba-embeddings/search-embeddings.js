import { supabase } from './supabaseClient.js'
import { createEmbedding } from './geminiClient.js'

/**
 * Scrimba Lesson: Semantic search & Query embeddings using similarity search
 * Converts query into a Gemini vector and calls Supabase match_documents function
 */
async function searchMovies(queryText, matchThreshold = 0.5, matchCount = 3) {
  console.log(`🔍 Searching for movies matching: "${queryText}"...\n`)

  try {
    // 1. Create embedding vector for the search query
    const queryEmbedding = await createEmbedding(queryText)

    // 2. Query Supabase using the match_documents function created in 01_schema.sql
    const { data: matchedDocuments, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount
    })

    if (error) {
      console.error('❌ Search error:', error.message)
      return
    }

    if (!matchedDocuments || matchedDocuments.length === 0) {
      console.log('No matching movies found above similarity threshold.')
      return
    }

    console.log(`Top ${matchedDocuments.length} matches:`)
    matchedDocuments.forEach((doc, idx) => {
      console.log(`\n#${idx + 1} [Similarity: ${(doc.similarity * 100).toFixed(1)}%]`)
      console.log(doc.content)
    })
  } catch (err) {
    console.error('Search failed:', err.message)
  }
}

// Example usage:
const query = process.argv.slice(2).join(' ') || 'A movie about atomic bomb and physics'
searchMovies(query)
