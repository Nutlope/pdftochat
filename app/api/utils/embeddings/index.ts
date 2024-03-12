import { TogetherAIEmbeddings } from '@langchain/community/embeddings/togetherai';

export function loadEmbeddingsModel() {
  return new TogetherAIEmbeddings({
    apiKey: process.env.TOGETHER_AI_API_KEY,
    modelName: 'togethercomputer/m2-bert-80M-8k-retrieval',
  });
}
