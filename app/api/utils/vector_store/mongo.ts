import { MongoClient } from 'mongodb';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { Embeddings } from '@langchain/core/embeddings';

export async function loadMongoDBStore({
  embeddings,
}: {
  embeddings: Embeddings;
}) {
  const mongoDbClient = new MongoClient(process.env.MONGODB_ATLAS_URI ?? '');

  await mongoDbClient.connect();

  const dbName = process.env.MONGODB_ATLAS_DB_NAME ?? '';
  const collectionName = process.env.MONGODB_ATLAS_COLLECTION_NAME ?? '';
  const collection = mongoDbClient.db(dbName).collection(collectionName);

  const vectorstore = new MongoDBAtlasVectorSearch(embeddings, {
    indexName: process.env.MONGODB_ATLAS_INDEX_NAME ?? 'vector_index',
    collection,
  });

  return {
    vectorstore,
    mongoDbClient,
  };
}
