HNSW = Hierarchical Navigable Small World

Purpose:
Fast approximate nearest-neighbor search over vectors.

Core idea:
Use a multilayer graph to navigate toward nearby vectors
without comparing against every vector.

Structure:
- Bottom layer: every vector
- Upper layers: progressively smaller subsets
- Edges: connections between selected neighboring nodes

Search:
1. Start at an entry point in an upper layer.
2. Move toward closer candidates.
3. Descend to lower layers.
4. Explore promising candidates at Layer 0.
5. Return top-k nearest results.

Parameters in pgvector:
m
→ maximum connections per layer

ef_construction
→ candidate-list size during graph construction

ef_search
→ candidate-list size during querying

Trade-off:
Faster search with approximate results;
recall can be improved by spending more time searching.

Exact search:
Compare every vector.

HNSW:
Navigate a graph to search fewer candidates.

Recall:
How many of the true nearest neighbors are recovered?


Interview answer
HNSW is a graph-based approximate nearest-neighbor indexing algorithm used for efficient vector similarity search. It builds a multilayer proximity graph, with fewer nodes in upper layers and all vectors in the bottom layer. Search begins in an upper layer, navigates toward promising candidates, and descends through the hierarchy to find nearby vectors. It typically reduces search effort compared with brute-force search, trading some exactness for speed. Its main tuning parameters in pgvector are m, ef_construction, and ef_search.