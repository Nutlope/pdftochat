import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { Embeddings } from "@langchain/core/embeddings";

export async function loadMongoDBStore({
  collectionName,
  embeddings,
}: {
  collectionName: string;
  embeddings: Embeddings;
}) {
  const mongoDbClient = new MongoClient(process.env.MONGODB_URI ?? '');
  
  await mongoDbClient.connect();

  const dbName = process.env.MONGODB_DB_NAME ?? '';
  const collection = mongoDbClient.db(dbName).collection(collectionName);

  const vectorstore = new MongoDBAtlasVectorSearch(embeddings, {
    collection,
  });

  return {
    vectorstore,
    mongoDbClient,
  }
}