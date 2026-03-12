import { Embeddings } from '@langchain/core/embeddings';
import { Callbacks } from '@langchain/core/callbacks/manager';
import { loadPineconeStore } from './pinecone';
import { loadMongoDBStore } from './mongo';
import { loadChromaStore, ChromaRetriever } from './chroma';

export async function loadVectorStore({
  namespace,
  embeddings,
}: {
  namespace: string;
  embeddings: Embeddings;
}) {
  const vectorStoreEnv = process.env.NEXT_PUBLIC_VECTORSTORE ?? 'pinecone';

  if (vectorStoreEnv === 'pinecone') {
    return await loadPineconeStore({ namespace, embeddings });
  } else if (vectorStoreEnv === 'mongodb') {
    return await loadMongoDBStore({ embeddings });
  } else if (vectorStoreEnv === 'chroma') {
    return loadChromaStore(namespace);
  } else {
    throw new Error(`Invalid vector store id provided: ${vectorStoreEnv}`);
  }
}

export async function loadRetriever({
  embeddings,
  chatId,
  callbacks,
}: {
  embeddings: Embeddings;
  chatId: string;
  callbacks?: Callbacks;
}) {
  const vectorStoreEnv = process.env.NEXT_PUBLIC_VECTORSTORE ?? 'pinecone';

  // Chroma has its own retriever with built-in hybrid search — bypass the
  // generic loadVectorStore path so we don't create a throwaway collection.
  if (vectorStoreEnv === 'chroma') {
    const retriever = new ChromaRetriever(chatId, 4, { callbacks });
    return { retriever, mongoDbClient: undefined };
  }

  let mongoDbClient;
  const store = await loadVectorStore({ namespace: chatId, embeddings });
  const vectorstore = store.vectorstore;
  if ('mongoDbClient' in store) {
    mongoDbClient = store.mongoDbClient;
  }

  // Mongo uses metadata filtering; Pinecone uses namespaces.
  const filter =
    vectorStoreEnv === 'mongodb'
      ? { preFilter: { docstore_document_id: { $eq: chatId } } }
      : undefined;

  const retriever = vectorstore.asRetriever({ filter, callbacks });
  return { retriever, mongoDbClient };
}
