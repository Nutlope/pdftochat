import type { Message as VercelChatMessage } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

import { AIMessage, ChatMessage, HumanMessage } from '@langchain/core/messages';
import {
  openai,
  PrepareChatResult,
  RAGChat,
  togetherai,
} from '@upstash/rag-chat';
import { aiUseChatAdapter } from '@upstash/rag-chat/nextjs';
import { Index } from '@upstash/vector';

export const runtime =
  process.env.NEXT_PUBLIC_VECTORSTORE === 'mongodb' ? 'nodejs' : 'edge';

const formatVercelMessages = (message: VercelChatMessage) => {
  if (message.role === 'user') {
    return new HumanMessage(message.content);
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content);
  } else {
    console.warn(
      `Unknown message type passed: "${message.role}". Falling back to generic message type.`,
    );
    return new ChatMessage({ content: message.content, role: message.role });
  }
};

/**
 * This handler initializes and calls a retrieval chain. It composes the chain using
 * LangChain Expression Language. See the docs for more information:
 *
 * https://js.langchain.com/docs/get_started/quickstart
 * https://js.langchain.com/docs/guides/expression_language/cookbook#conversational-retrieval-chain
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    if (!messages.length) {
      throw new Error('No messages provided.');
    }
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatVercelMessages);
    const currentMessageContent = messages[messages.length - 1].content;
    const chatId = body.chatId;

    const ragchat = new RAGChat({
      vector: new Index(),
      model: togetherai('mistralai/Mixtral-8x7B-Instruct-v0.1', {
        temperature: 0,
        apiKey: process.env.TOGETHER_AI_API_KEY,
      }),
      debug: process.env.NODE_ENV == 'development',
    });

    let serializedSources: string = '';
    const stream = await ragchat.chat(currentMessageContent, {
      onContextFetched(context) {
        serializedSources = Buffer.from(
          JSON.stringify(
            context.map((doc) => {
              return {
                pageContent: doc.data.slice(0, 50) + '...',
                metadata: doc.metadata,
              };
            }),
          ),
        ).toString('base64');
        return context;
      },
      promptFn({ context, chatHistory }) {
        return `
          You are a helpful AI assistant. Use the following pieces of context and chat history to answer the question at the end.
          If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
          If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

          <context>
          ${context}
          </context>
          <chat_history>
          ${chatHistory}
          </chat_history>
          Please return your answer in markdown with clear headings and lists.
              `;
      },
      namespace: chatId,
      streaming: true,
    });

    return new Response(stream.output, {
      headers: {
        'x-message-index': (formattedPreviousMessages.length + 1).toString(),
        'x-sources': serializedSources,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
