User query
    ↓
Gemini embedding
    ↓
Query vector
    ↓
Compare against every document vector
    ↓
Cosine similarity score
    ↓
Sort by score, highest first
    ↓
Return top 3


10. What happens when you search?
Suppose your query is:
I forgot my login details.


You have three relevant documents:
A. Reset your password

B. Recover account access

C. Two-factor authentication


The code creates:
Query vector
    │
    ├── cosine(query, A)
    ├── cosine(query, B)
    └── cosine(query, C)


For illustration, suppose the scores were:
Document	Illustrative cosine score
Recover account access	0.86
Reset your password	0.82
Two-factor authentication	0.71
The system ranks the results as:
1. Recover account access
2. Reset your password
3. Two-factor authentication


These numbers are illustrative, not actual measurements from Gemini.
The key distinction is that the query uses login details, while the documents may use account recovery or password reset. The embedding model makes it possible for the vectors to capture relationships beyond exact word overlap.
11. Why calculate every score?
Your current implementation calculates one score for each document.
If you have \(N\) documents and each vector has \(D\) dimensions, the comparison work is roughly proportional to:
\[
O(ND)
\]

For 50 documents and 768-dimensional vectors, this is perfectly reasonable.
For 10 million documents and 768-dimensional vectors, an exhaustive scan would involve billions of component-level operations per query. At that scale, you would investigate indexing or a dedicated search service.
This is the reason vector databases and approximate nearest-neighbor indexes exist—not because cosine similarity itself is difficult, but because searching through enormous collections efficiently is a different engineering problem.


What is a vector database, and why is indexing needed?
You've now demonstrated that you can search embeddings without a vector database. That is exactly what you should do before moving on.
A vector database adds storage, retrieval and indexing capabilities for vector similarity search. Depending on the system, it can also manage metadata, filtering, updates and other operational requirements. 

Weaviate



13. Exact search versus indexed search
Your current algorithm is exact search:
Query vector
     │
     ├── compare with document 1
     ├── compare with document 2
     ├── compare with document 3
     ├── ...
     └── compare with document N
                 │
                 ▼
            Rank results


It examines every vector. For a small dataset this is simple and accurate.
An approximate nearest-neighbor index tries to narrow down the candidates:
Query vector
     │
     ▼
       Index
     │
     ▼
Likely nearby vectors
     │
     ▼
Compare / rank candidates


The trade-off is:
Exact search	Approximate nearest-neighbor search
Examines all candidates	Searches a smaller candidate set
Returns the exact nearest results for the chosen metric	May miss some true nearest neighbors
Easy to implement and reason about	Requires index configuration and quality evaluation
Good starting point for small datasets	Useful when scale or latency justifies it
An approximate index doesn't automatically improve semantic relevance. It improves retrieval efficiency, with a possible loss of recall. It should be benchmarked against exact search to determine whether the speed improvement justifies that trade-off. 

Weaviate
+1



Two indexing concepts worth knowing
- HNSW: Organizes vectors in a multilayer graph to navigate toward nearby vectors. It is often chosen for a strong speed/recall trade-off, at the cost of memory and index-building work.
- IVFFlat: Organizes vectors into clusters/lists and searches selected portions rather than the entire collection. It has different build-time and recall trade-offs.
These are implementation concepts to understand later, not algorithms you need to reproduce now. pgvector supports both index types and documents their respective trade-offs. 

GitHub
+1



For your 20–50 documents, don't add HNSW yet. An index would add complexity with little benefit at this size.