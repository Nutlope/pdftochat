import "dotenv/config";

import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import { type DynamicRunEvaluatorParams, runOnDataset } from "langchain/smith";

import { loadEmbeddingsModel } from '@/app/api/utils/embeddings';
import { loadRetriever } from '@/app/api/utils/vector_store';
import { createRAGChain } from '@/utils/ragChain';

const chatId = process.env.LANGSMITH_EVAL_CHAT_ID;
const datasetName = process.env.LANGSMITH_EVAL_DATASET_NAME;

export async function evaluateRagChain() {
  let mongoDbClient;
  try {
    if (chatId === undefined) {
      throw new Error(`You must set up a test chat id in your vectorstore and set it as process.env.LANGSMITH_EVAL_CHAT_ID.`);
    }
    if (datasetName === undefined) {
      throw new Error(`You must set up a LangSmith dataset to run evals against and set its name as process.env.LANGSMITH_EVAL_DATASET_NAME.`);
    }
    const model = new ChatTogetherAI({
      modelName: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      temperature: 0,
    });
  
    const embeddings = loadEmbeddingsModel();
  
    const retrieverInfo = await loadRetriever({
      chatId,
      embeddings,
    });
  
    const retriever = retrieverInfo.retriever;
    mongoDbClient = retrieverInfo.mongoDbClient;
  
    const ragChain = await createRAGChain(model, retriever);
  
    const containsAResponse = (props: DynamicRunEvaluatorParams) => {
      return {
        key: "contains_response",
        score: !!props.prediction,
      };
    }
    await runOnDataset(ragChain, datasetName, {
      evaluators: [containsAResponse]
    }); 
  } catch (e) {
    console.log("There was a problem when running the evaluation:", e);
  } finally {
    mongoDbClient?.close();
  }
}

evaluateRagChain();