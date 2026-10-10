# EMBEDDINGS + VECTOR DB + RAG
## First-Principles Notes

### 1. Token vs Token ID vs Embedding

**Token**
→ Piece of text produced by tokenizer.

Example:
```text
"I forgot my password"
↓
["I", " forgot", " my", " password"]
```

**Token ID**
→ Integer identifier of a token in that tokenizer's vocabulary.

```text
"I"        → 101
" forgot"  → 5421
```

Important:
- Same tokenizer → same token normally gets same ID.
- Different tokenizer/model → IDs can be different.
- ID is only an **identifier**, not meaning.
- `4821` being close to `4822` means nothing semantically.

---

# 2. Token Embedding

Token ID is used to **look up a row** in the model's embedding matrix.

```text
token ID
   ↓
embedding matrix[row]
   ↓
vector
```

Example:

```text
"cat" → 4821
4821 → [0.12, -0.41, 0.83, ...]
```

So:

```text
Token ID = index
Embedding = learned vector
```

The embedding matrix is learned during training.

---

# 3. Semantic/Text Embedding

Goal:

> Convert an entire input into a vector representation useful for measuring semantic relationships.

```text
"I forgot my password"
        ↓
Embedding Model
        ↓
[0.12, -0.41, 0.83, ...]
```

A semantic embedding is a **learned numerical representation**, not a literal "meaning stored in numbers."

---

# 4. Does Every Word Have an Embedding?

Internally, the model processes tokens and creates token-level representations.

Conceptually:

```text
"I forgot my password"
        ↓
tokens
        ↓
token representations
        ↓
contextual processing
        ↓
ONE final text embedding
```

Do NOT think:

```text
word → permanent vector → simply average
```

Modern models use contextual processing; exact pooling/architecture depends on the embedding model.

---

# 5. Token Embedding vs Semantic Embedding

### Token embedding
Used inside an LLM/Transformer.

```text
token ID
↓
token vector
↓
Transformer
```

### Semantic/text embedding
Used for:

```text
semantic search
RAG
similarity
clustering
recommendation
```

```text
text
↓
embedding model
↓
one vector
```

Embedding models are different from generative models.

---

# 6. Why Embeddings Exist

Keyword search:

```text
"How do I reset my password?"
```

vs

```text
"I forgot my login credentials."
```

Few exact words overlap.

Semantic embeddings represent both in a vector space so their relationship can be measured mathematically.

Core idea:

```text
Meaning/relationship
        ↓
Vector
        ↓
Geometry
        ↓
Math
```

---

# 7. Embedding Space

Think of vectors as coordinates in a high-dimensional semantic space.

```text
cat   → vector A
kitten→ vector B
car   → vector C
```

Ideally:

```text
similarity(A,B) > similarity(A,C)
```

The model learns the useful geometry; dimensions usually do not have simple human-readable meanings.

---

# 8. Embedding Dimension

Number of values in the vector.

```text
[0.2, 0.4, -0.1]
```

→ 3 dimensions.

Real models may use hundreds/thousands of dimensions.

Higher dimension allows richer representations; individual dimensions should not be interpreted independently.

---

# 9. Context Matters

Same word can mean different things:

```text
"I deposited money in the bank."
"I sat on the bank of the river."
```

Modern contextual models use surrounding text when creating representations.

---

# 10. Document → Embedding Pipeline

For RAG/search:

```text
Document
   ↓
Chunking
   ↓
Embedding Model
   ↓
Chunk Vector
   ↓
Vector DB
```

Usually we embed **chunks**, not an entire huge document.

Example:

```text
Chunk 1 → vector 1
Chunk 2 → vector 2
Chunk 3 → vector 3
```

---

# 11. What Is Stored in a Vector DB?

Conceptually:

```text
{
  id: "chunk_001",
  vector: [0.82, 0.12, -0.33, ...],
  text: "Employees get 20 vacation days...",
  metadata: {
    page: 3,
    source: "handbook.pdf"
  }
}
```

So vector DB ≠ only vectors.

Usually:

```text
Vector
+
ID
+
Metadata
+
optional stored text/payload
```

---

# 12. User Query

User asks:

```text
"How many vacation days do employees get?"
```

The query is also converted into a vector.

```text
Question
   ↓
SAME embedding model
   ↓
Query vector
```

Example:

```text
Q = [0.79, 0.11, -0.29, ...]
```

Why?

Because stored documents and query must exist in the **same/compatible embedding space**.

---

# 13. How Vector DB Queries

Vector DB receives something conceptually like:

```json
{
  "vector": [0.79, 0.11, -0.29, ...],
  "topK": 5
}
```

It performs similarity/nearest-neighbor search against stored vectors.

Conceptually:

```text
Q ↔ V1
Q ↔ V2
Q ↔ V3
...
```

Using a metric such as:

```text
Cosine similarity
Dot product
Euclidean distance
```

---

# 14. What Is Top-K?

```text
topK = 5
```

means:

> Return the 5 most similar vectors/results.

Example:

```text
chunk_17 → 0.94
chunk_03 → 0.91
chunk_29 → 0.87
...
```

---

# 15. What Does Vector DB Return?

Typically:

```text
ID
+
similarity/distance score
+
metadata
+
possibly text/payload
```

Example:

```json
[
  {
    "id": "chunk_17",
    "score": 0.94,
    "text": "Employees receive 20 vacation days."
  }
]
```

The vector DB **does not generate the answer**.

It retrieves relevant data.

---

# 16. Full RAG Flow

### Ingestion

```text
Documents
   ↓
Chunk
   ↓
Embedding Model
   ↓
Vectors
   ↓
Vector DB
```

### Query

```text
User Question
   ↓
Embedding Model
   ↓
Query Vector
   ↓
Vector DB
   ↓
Similarity Search
   ↓
Top-K Chunks
   ↓
LLM
   ↓
Answer
```

This separation between embeddings, retrieval, and generation is fundamental.

---

# 17. What Does the LLM Actually Receive?

Not usually the vector.

It receives **text/context** retrieved from the DB.

```text
Question:
How many vacation days do I get?

Context:
Employees receive 20 paid vacation days per year.
```

Then:

```text
Context + Question
        ↓
       LLM
        ↓
      Answer
```

---

# 18. Embedding Model vs Generation LLM

They can be different.

Example:

```text
Documents → Gemini Embedding Model
Query     → Gemini Embedding Model
                      ↓
                Retrieved chunks
                      ↓
                   GPT/Claude
                      ↓
                    Answer
```

This is perfectly fine.

The important compatibility requirement is on the **retrieval side**:

```text
Document embeddings
        ↕
Query embeddings
```

They should use the same/compatible embedding space.

---

# 19. What If Documents and Queries Use Different Embedding Models?

Example:

```text
Documents → Model A
Queries   → Model B
```

Potential problems:

### 1. Different dimensions

```text
Model A → 1536 dims
Model B → 768 dims
```

Cannot directly compare vectors using normal vector operations.

### 2. Same dimension, different space

Even:

```text
A → 768
B → 768
```

does NOT guarantee compatibility.

Why?

Each model can learn a different coordinate system / geometry.

So:

```text
same dimensions ≠ same embedding space
```

### Result:

Similarity scores may be meaningless or retrieval quality may collapse.

---

# 20. What Happens If You Change Embedding Models?

Old:

```text
Documents → Model A → vectors A
```

New model:

```text
Model B
```

You generally need:

```text
Documents
   ↓
re-embed with Model B
   ↓
new vectors
   ↓
new/updated index
```

Then query with Model B.

---

# 21. Vector DB vs Embedding Model

### Embedding model

```text
Text → Vector
```

### Vector DB

```text
Store vectors
+
Search vectors efficiently
```

The vector DB does not create semantic meaning. The embedding model provides the representation; the DB performs retrieval over it.

---

# 22. The Core Mental Model

```text
TEXT
 ↓
EMBEDDING MODEL
 ↓
VECTOR
 ↓
POSITION IN VECTOR SPACE
 ↓
SIMILARITY / DISTANCE
 ↓
RETRIEVAL
```

RAG:

```text
Documents
 ↓
Chunks
 ↓
Embeddings
 ↓
Vector DB

Query
 ↓
Query Embedding
 ↓
Vector Search
 ↓
Relevant Chunks
 ↓
LLM
 ↓
Answer
```

---

# INTERVIEW QUESTIONS

## BASIC

### Q1. What is an embedding?

**Answer:**  
An embedding is a learned numerical vector representation of an input, designed so useful relationships between inputs can be measured geometrically.

**Follow-up:** Why use embeddings?

**Answer:**  
To compare semantic relationships mathematically instead of relying only on exact keyword overlap.

---

### Q2. What is the difference between a token ID and an embedding?

**Answer:**  
A token ID is an integer identifier/index. An embedding is a learned vector representation associated with the model's representation of the input.

**Follow-up:** Is `4821` meaningful?

**Answer:**  
No. It is only an identifier within that tokenizer/vocabulary.

---

### Q3. Does every word have one fixed embedding?

**Answer:**  
Static word-embedding systems can work that way, but modern contextual models produce representations influenced by surrounding context. Text embedding models then produce a final representation for the whole input.

**Follow-up:** Why does context matter?

**Answer:**  
Because the meaning of a word can change by context, e.g. "bank" as finance vs river bank.

---

### Q4. What is embedding dimension?

**Answer:**  
The number of values in an embedding vector.

Example:

```text
[0.2, 0.4, -0.1]
```

has 3 dimensions.

---

### Q5. Why are embeddings high-dimensional?

**Answer:**  
Language relationships are complex, so many dimensions allow the model to represent richer patterns.

**Follow-up:** Does each dimension have a specific meaning?

**Answer:**  
Usually not. Information is distributed across dimensions.

---

### Q6. What is an embedding space?

**Answer:**  
A mathematical vector space in which inputs are represented as vectors and relationships can be compared using geometry.

---

### Q7. Why not use token IDs for semantic search?

**Answer:**  
IDs are labels, not semantic coordinates. `100` and `101` being numerically close says nothing about semantic similarity.

---

### Q8. What is semantic search?

**Answer:**  
Search that retrieves content based on learned semantic similarity rather than only exact keyword overlap.

---

# RAG / VECTOR DB

### Q9. What is a vector database?

**Answer:**  
A database/system optimized to store vectors and efficiently perform similarity or nearest-neighbor search.

**Follow-up:** Is a vector DB required to create embeddings?

**Answer:**  
No. You can generate and compare embeddings yourself; the DB mainly makes large-scale retrieval efficient.

---

### Q10. What is stored in a vector DB?

**Answer:**  
Typically:

```text
vector
ID
metadata
optional text/payload
```

---

### Q11. Why chunk documents before embedding?

**Answer:**  
Smaller chunks allow more precise retrieval and prevent one huge document vector from mixing unrelated information.

**Follow-up:** Why not embed the whole PDF?

**Answer:**  
A query about one section might retrieve the entire document instead of the specific relevant passage.

---

### Q12. How does RAG work?

**Answer:**

```text
Documents
→ chunks
→ embeddings
→ vector DB

Query
→ query embedding
→ similarity search
→ top-K chunks
→ LLM
→ answer
```

---

### Q13. Is the user query sent directly to the vector DB?

**Answer:**  
Usually no. The query is first converted into an embedding vector, then that vector is sent to the vector DB.

---

### Q14. What does the vector DB query look like?

**Answer:**

```json
{
  "vector": [...],
  "topK": 5
}
```

Optionally it can include metadata filters.

---

### Q15. What is Top-K?

**Answer:**  
The number of highest-ranked retrieval results requested.

```text
topK = 5
```

→ return 5 best matches.

---

### Q16. How does the vector DB find relevant documents?

**Answer:**  
It compares the query vector against stored vectors using a similarity/distance metric and returns the nearest/highest-scoring matches.

---

### Q17. Which similarity metrics are common?

**Answer:**

```text
Cosine similarity
Dot product
Euclidean/L2 distance
```

The correct choice depends on the model and system.

---

### Q18. Does the vector DB understand the meaning of the vector?

**Answer:**  
No. The embedding model creates a representation with useful semantic geometry. The vector DB mainly performs storage/indexing/search over that geometry.

---

### Q19. Does the vector DB return the final answer?

**Answer:**  
No. It returns matching records/chunks. The application passes those chunks to the LLM, which generates the final answer.

---

### Q20. What does a vector DB typically return?

**Answer:**

```text
ID
score/distance
metadata
optional text/payload
```

---

# EMBEDDING COMPATIBILITY

### Q21. Can I embed documents with Model A and query with Model B?

**Answer:**  
Normally, you should not do this unless the models are explicitly designed to share a compatible embedding space.

**Follow-up:** Why?

**Answer:**  
Their coordinates and learned geometry may differ, so similarity comparisons may be invalid.

---

### Q22. What if both models have the same dimension?

**Answer:**  
That still does not guarantee compatibility.

```text
768 dims ≠ automatically same vector space
```

---

### Q23. What if Model A outputs 1536 dimensions and Model B outputs 768?

**Answer:**  
Standard vector operations between the two are incompatible because their dimensions differ.

---

### Q24. Can I use one embedding model and another LLM for generation?

**Answer:**  
Yes.

Example:

```text
Embedding Model A
        ↓
Vector Search
        ↓
Retrieved Text
        ↓
LLM B
        ↓
Answer
```

The generation LLM doesn't need to share the embedding space.

---

### Q25. If I switch embedding models, what usually happens?

**Answer:**  
Re-embed the stored documents with the new model and rebuild/update the vector index.

---

# DEEPER INTERVIEW QUESTIONS

### Q26. Why must query and document embeddings use the same model?

**Answer:**  
Because similarity only makes sense when both vectors belong to the same compatible representation space.

---

### Q27. Why can't a vector DB just search the original text?

**Answer:**  
A vector DB is optimized for vector similarity. The semantic understanding was already encoded into vectors by the embedding model.

---

### Q28. Is an embedding the same as meaning?

**Answer:**  
No. It is a learned representation whose geometry captures useful relationships. Different models can represent the same text differently.

---

### Q29. What is the difference between keyword search and semantic search?

**Answer:**

```text
Keyword:
exact/lexical overlap

Semantic:
vector similarity in learned representation space
```

---

### Q30. What is the purpose of metadata in a vector DB?

**Answer:**  
To store useful information such as:

```text
document ID
page
source
date
department
user
```

and enable filtering or traceability.

---

### Q31. Why return top-K instead of only the single best result?

**Answer:**  
The best single vector may not contain enough context. Multiple relevant chunks give the LLM a better evidence set.

---

### Q32. Why can retrieval fail even when embeddings are used?

**Answer:**  
Possible reasons:

```text
poor chunking
bad embedding model
wrong top-K
wrong similarity metric
query/document mismatch
missing metadata filters
irrelevant chunks
```

---

### Q33. What is the difference between retrieval and generation?

**Answer:**

```text
Retrieval → finds relevant information
Generation → produces the final answer
```

In RAG:

```text
Embedding + Vector DB = retrieval
LLM = generation
```

---

### Q34. Can embeddings generate text?

**Answer:**  
No. Embeddings provide representations. They do not themselves generate answers.

Your source explicitly distinguishes embeddings from generation.

---

### Q35. Can I build semantic search without a vector DB?

**Answer:**  
Yes.

For a small dataset:

```text
query vector
 ↓
compare against every stored vector
 ↓
sort by similarity
```

A vector DB becomes valuable when the dataset becomes large and efficient nearest-neighbor search is needed.

---

# ONE-MINUTE INTERVIEW ANSWER

### "Explain RAG using embeddings."

> RAG first splits documents into chunks and converts each chunk into a vector using an embedding model. These vectors, along with IDs and metadata, are stored in a vector database. When a user asks a question, the same embedding model converts the question into a query vector. The vector database performs similarity search and returns the top-K relevant chunks. The application then places those chunks into the LLM context along with the user's question, and the LLM generates the final answer.

---

# 10-SECOND MEMORY VERSION

```text
DOCUMENT
→ CHUNK
→ EMBEDDING
→ VECTOR DB

QUERY
→ SAME EMBEDDING MODEL
→ QUERY VECTOR
→ VECTOR SEARCH
→ TOP-K CHUNKS
→ LLM
→ ANSWER
```

### Golden rules

```text
Token ID ≠ embedding

Embedding ≠ vector DB

Vector DB ≠ LLM

Same embedding space for:
document vectors ↔ query vectors

Different generation LLM = OK

Different embedding model = usually re-embed
```