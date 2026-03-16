import { NextRequest, NextResponse } from 'next/server';
import type { Message as VercelChatMessage } from 'ai';
import { createRAGChain } from '@/utils/ragChain';

import type { Document } from '@langchain/core/documents';
import { HumanMessage, AIMessage, ChatMessage } from '@langchain/core/messages';
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import { loadRetriever } from '../utils/vector_store';
import { loadEmbeddingsModel } from '../utils/embeddings';

// Chroma Cloud client and MongoDB both require Node.js runtime (not edge).
const chromaOrMongo =
  process.env.NEXT_PUBLIC_VECTORSTORE === 'mongodb' ||
  process.env.NEXT_PUBLIC_VECTORSTORE === 'chroma';
export const runtime = chromaOrMongo ? 'nodejs' : 'edge';

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
  let mongoDbClient: Awaited<ReturnType<typeof loadRetriever>>['mongoDbClient'];

  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const chatId = body.chatId;
    console.log('[chat] POST handler started:', { chatId, messageCount: messages.length, vectorStore: process.env.NEXT_PUBLIC_VECTORSTORE });

    if (!messages.length) {
      throw new Error('No messages provided.');
    }
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatVercelMessages);
    const currentMessageContent = messages[messages.length - 1].content;
    console.log('[chat] Current message:', currentMessageContent.slice(0, 100));

    const model = new ChatTogetherAI({
      modelName: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      temperature: 0,
    });

    const embeddings = loadEmbeddingsModel();

    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });

    console.log('[chat] Loading retriever...');
    const retrieverInfo = await loadRetriever({
      chatId,
      embeddings,
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            console.log('[chat] Retriever returned docs:', documents.length);
            resolveWithDocuments(documents);
          },
        },
      ],
    });

    const retriever = retrieverInfo.retriever;
    mongoDbClient = retrieverInfo.mongoDbClient;
    console.log('[chat] Retriever loaded, creating RAG chain...');

    const ragChain = await createRAGChain(model, retriever);
    console.log('[chat] RAG chain created, streaming...');

    const stream = await ragChain.stream({
      input: currentMessageContent,
      chat_history: formattedPreviousMessages,
    });

    const documents = await documentPromise;
    console.log('[chat] Documents resolved:', documents.length);
    const serializedSources = Buffer.from(
      JSON.stringify(
        documents.map((doc) => {
          return {
            pageContent: doc.pageContent.slice(0, 50) + '...',
            metadata: doc.metadata,
          };
        }),
      ),
    ).toString('base64');

    // Convert to bytes so that we can pass into the HTTP response
    const byteStream = stream.pipeThrough(new TextEncoderStream());

    return new Response(byteStream, {
      headers: {
        'x-message-index': (formattedPreviousMessages.length + 1).toString(),
        'x-sources': serializedSources,
      },
    });
  } catch (e: any) {
    console.error('[chat] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    if (mongoDbClient) {
      await mongoDbClient.close();
    }
  }
}
