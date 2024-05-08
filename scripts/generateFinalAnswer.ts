import { DocumentInterface } from '@langchain/core/documents';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import 'dotenv/config';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';

type Data = {
  id: string;
  input: string;
  context: Array<DocumentInterface>;
};

export async function generateBaselineAnswer(
  input: {
    input: string;
    context: Array<DocumentInterface>;
  },
  llm: BaseChatModel,
) {
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
  const outputParser = new StringOutputParser();

  const chain = answerPrompt.pipe(llm).pipe(outputParser);

  const result = await chain.invoke({
    chat_history: [],
    input: input.input,
    context: input.context.map((c) => c.pageContent).join('\n'),
  });
  return result;
}
