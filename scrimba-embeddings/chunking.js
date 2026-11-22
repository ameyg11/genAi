import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

// Sample document to demonstrate chunking
const sampleDocument = `
Artificial Intelligence has revolutionized how we interact with technology. At the core of modern natural language processing are Large Language Models (LLMs), which can understand, summarize, and generate human-like text.

However, LLMs have key limitations. They only know what was in their training data up to their cutoff date, and they cannot access your private data. To solve this, developers use Retrieval-Augmented Generation, commonly known as RAG.

In a RAG pipeline, external documents are converted into numbers called vector embeddings. These vectors capture the deep semantic meaning of text. When a user asks a question, we convert their question into a vector and search for the most similar document vectors stored in a vector database like Supabase with pgvector.

Before converting documents into embeddings, they must be broken into smaller pieces. This process is called chunking. If you pass an entire book as a single vector, the specific details get diluted and lost. Splitting text into coherent, bite-sized chunks ensures high search precision.
`.trim()

async function runChunkingDemo() {
  console.log('--- ✂️ LangChain Chunking Demo ---\n')
  console.log(`Original Document Length: ${sampleDocument.length} characters\n`)

  /*
   * 1. Initialize the RecursiveCharacterTextSplitter
   *
   * - chunkSize: Maximum characters allowed per chunk.
   * - chunkOverlap: Number of characters to carry over from the end
   *   of one chunk into the beginning of the next chunk.
   * - separators: The order of natural boundaries LangChain tries first:
   *   ["\n\n", "\n", " ", ""]
   */
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 250,
    chunkOverlap: 40,
    separators: ['\n\n', '\n', ' ', '']
  })

  // 2. Split raw text into an array of strings
  const textChunks = await splitter.splitText(sampleDocument)

  console.log(`✅ Document split into ${textChunks.length} chunks:\n`)

  textChunks.forEach((chunk, index) => {
    console.log(`[Chunk ${index + 1}] (${chunk.length} chars)`)
    console.log(`"${chunk}"`)
    console.log('-'.repeat(50))
  })

  /*
   * 3. Splitting into LangChain Document Objects with Metadata
   * (Ideal for storing in Supabase with extra context like source, author, etc.)
   */
  console.log('\n--- 📄 Creating Documents with Metadata ---')
  const docs = await splitter.createDocuments(
    [sampleDocument],
    [{ source: 'ai-intro.txt', topic: 'RAG & Chunking' }]
  )

  console.log(`Generated ${docs.length} Document objects. Example of first object:`)
  console.log(docs[0])
}

runChunkingDemo().catch(console.error)
