import { Embeddings } from '@langchain/core/embeddings';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

export async function loadPineconeStore({
  namespace,
  embeddings,
}: {
  namespace: string;
  embeddings: Embeddings;
}) {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? '',
  });

  const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';
  const index = pinecone.index(PINECONE_INDEX_NAME);

  const vectorstore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace,
    textKey: 'text',
  });

  return {
    vectorstore,
  };
}
