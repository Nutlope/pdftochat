import { Embeddings } from '@langchain/core/embeddings';
import { loadPineconeStore } from './pinecone';
import { loadMongoDBStore } from './mongo';

export async function loadVectorStore({
  namespace,
  embeddings,
}: {
  namespace: string;
  embeddings: Embeddings;
}) {
  const vectorStoreEnv = process.env.NEXT_PUBLIC_VECTORSTORE ?? 'pinecone';

  if (vectorStoreEnv === 'pinecone') {
    return await loadPineconeStore({
      namespace,
      embeddings,
    });
  } else if (vectorStoreEnv === 'mongodb') {
    return await loadMongoDBStore({
      embeddings,
    });
  } else {
    throw new Error(`Invalid vector store id provided: ${vectorStoreEnv}`);
  }
}
