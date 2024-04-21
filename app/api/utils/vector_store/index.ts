import { Embeddings } from '@langchain/core/embeddings';
import { loadPineconeStore } from './pinecone';
import { loadMongoDBStore } from './mongo';
import { Callbacks } from '@langchain/core/callbacks/manager';

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

export async function loadRetriever({
  embeddings,
  chatId,
  callbacks,
}: {
  // namespace: string;
  embeddings: Embeddings;
  chatId: string;
  callbacks?: Callbacks;
}) {
  let mongoDbClient;
  const store = await loadVectorStore({
    namespace: chatId,
    embeddings,
  });
  const vectorstore = store.vectorstore;
  if ('mongoDbClient' in store) {
    mongoDbClient = store.mongoDbClient;
  }
  // For Mongo, we will use metadata filtering to separate documents.
  // For Pinecone, we will use namespaces, so no filter is necessary.
  const filter =
    process.env.NEXT_PUBLIC_VECTORSTORE === 'mongodb'
      ? {
          preFilter: {
            docstore_document_id: {
              $eq: chatId,
            },
          },
        }
      : undefined;
  const retriever = vectorstore.asRetriever({
    filter,
    callbacks,
  });
  return {
    retriever,
    mongoDbClient,
  };
}
