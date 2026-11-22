# Scrimba Embeddings & Supabase pgvector Lab

A clean starting skeleton for following along with the Scrimba AI Engineer Path modules on Embeddings, Chunking, Supabase Vector DB, and Semantic Search.

---

## 📁 Project Structure

```
scrimba-embeddings/
├── .env.example          <- Template for Supabase URL/Key and AI API keys
├── .gitignore            <- Ignores node_modules and .env
├── package.json          <- Dependencies (@supabase/supabase-js, @langchain/textsplitters, dotenv, openai)
├── supabaseClient.js     <- Initialized Supabase client instance
├── 01_schema.sql         <- SQL script to enable pgvector & create documents table
├── chunking.js           <- LangChain text chunking demo (RecursiveCharacterTextSplitter)
├── index.js              <- Quick connection test script
├── store-embeddings.js   <- Starter file for "Store vector embeddings"
└── search-embeddings.js  <- Starter file for "Semantic search & similarity query"
```

---

## 🚀 Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Run the LangChain Chunking Demo
```bash
npm run chunk
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
- `SUPABASE_URL`: From **Supabase Dashboard** -> **Project Settings** -> **API** -> `Project URL`
- `SUPABASE_API_KEY`: From **Supabase Dashboard** -> **Project Settings** -> **API** -> `anon` / `public` key
- `OPENAI_API_KEY`: Your OpenAI API key

### 4. Run the SQL schema in Supabase
1. Go to your Supabase project dashboard.
2. Click on **SQL Editor** on the left menu.
3. Paste the contents of [`01_schema.sql`](./01_schema.sql) and click **Run**.

### 5. Test the connection
```bash
npm start
```
