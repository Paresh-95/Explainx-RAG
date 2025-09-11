# revns-server

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

# 4. Setup Redis (for job queue)
# On macOS: brew install redis && brew services start redis
# On Ubuntu: sudo apt install redis-server && sudo systemctl start redis

# 5. Create Pinecone index
# Go to pinecone.io, create index with:
# - Name: study-materials
# - Dimensions: 1536 (for OpenAI embeddings)
# - Metric: cosine

# 6. Run development server
bun run dev

This project was created using `bun init` in bun v1.1.38. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
