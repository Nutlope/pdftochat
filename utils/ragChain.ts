import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { BaseLanguageModel } from '@langchain/core/language_models/base';
import { BaseRetriever } from '@langchain/core/retrievers';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';

import type { Runnable } from '@langchain/core/runnables';
import type { BaseMessage } from '@langchain/core/messages';

const historyAwarePrompt = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder('chat_history'),
  ['user', '{input}'],
  [
    'user',
    'Given the above conversation, generate a concise vector store search query to look up in order to get information relevant to the conversation.',
  ],
]);

const ANSWER_SYSTEM_TEMPLATE = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

<context>
{context}
</context>

Please return your answer in markdown with clear headings and lists.`;

const answerPrompt = ChatPromptTemplate.fromMessages([
  ['system', ANSWER_SYSTEM_TEMPLATE],
  new MessagesPlaceholder('chat_history'),
  ['user', '{input}'],
]);

export async function createRAGChain(
  model: BaseLanguageModel,
  retriever: BaseRetriever,
): Promise<Runnable<{ input: string; chat_history: BaseMessage[] }, string>> {
  // Create a chain that can rephrase incoming questions for the retriever,
  // taking previous chat history into account. Returns relevant documents.
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm: model,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  // Create a chain that answers questions using retrieved relevant documents as context.
  const documentChain = await createStuffDocumentsChain({
    llm: model,
    prompt: answerPrompt,
  });

  // Create a chain that combines the above retriever and question answering chains.
  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: documentChain,
  });

  // "Pick" the answer from the retrieval chain output object.
  return conversationalRetrievalChain.pick('answer');
}
