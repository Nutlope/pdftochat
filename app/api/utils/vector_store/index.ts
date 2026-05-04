import { Embeddings } from '@langchain/core/embeddings';
import { Callbacks } from '@langchain/core/callbacks/manager';
import { loadPineconeStore, loadPineconeRetriever } from './pinecone';
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

/**
 * Load a retriever scoped to one or more document ids. When `documentIds`
 * has a single entry the per-store fast path is used; with multiple entries
 * each store fans out and merges by reciprocal-rank fusion (or equivalent).
 *
 * Backwards compatible: pass `chatId` (single string) and the retriever
 * behaves exactly as it did before.
 */
export async function loadRetriever({
  embeddings,
  chatId,
  documentIds,
  callbacks,
}: {
  embeddings?: Embeddings;
  chatId?: string;
  documentIds?: string[];
  callbacks?: Callbacks;
}) {
  const ids =
    documentIds && documentIds.length > 0
      ? documentIds
      : chatId
      ? [chatId]
      : [];
  if (ids.length === 0) {
    throw new Error('loadRetriever needs chatId or documentIds');
  }

  const vectorStoreEnv = process.env.NEXT_PUBLIC_VECTORSTORE ?? 'pinecone';

  if (vectorStoreEnv === 'chroma') {
    const retriever = new ChromaRetriever(ids, 4, { callbacks });
    return { retriever, mongoDbClient: undefined };
  }

  if (vectorStoreEnv === 'pinecone') {
    return await loadPineconeRetriever({
      documentIds: ids,
      embeddings: embeddings!,
      callbacks,
    });
  }

  // MongoDB — single shared collection, filter by document ids
  let mongoDbClient;
  const store = await loadVectorStore({
    namespace: ids[0],
    embeddings: embeddings!,
  });
  const vectorstore = store.vectorstore;
  if ('mongoDbClient' in store) {
    mongoDbClient = store.mongoDbClient;
  }

  const filter = { preFilter: { docstore_document_id: { $in: ids } } };
  const retriever = vectorstore.asRetriever({ filter, callbacks });
  return { retriever, mongoDbClient };
}
