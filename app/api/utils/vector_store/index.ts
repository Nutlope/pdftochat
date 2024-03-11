import { Embeddings } from "@langchain/core/embeddings";
import { loadPineconeStore } from "./pinecone";
import { loadMongoDBStore } from "./mongo";

export async function loadVectorStore({
  namespace,
  embeddings,
  vectorStoreId
}: {
  namespace: string;
  embeddings: Embeddings;
  vectorStoreId: string;
}) {
  if (vectorStoreId === "pinecone") {
    return await loadPineconeStore({
      namespace,
      embeddings,
    })
  } else if (vectorStoreId === "mongodb") {
    return await loadMongoDBStore({
      collectionName: namespace,
      embeddings,
    })
  } else {
    throw new Error(`Invalid vector store id provided: ${vectorStoreId}`)
  }
}