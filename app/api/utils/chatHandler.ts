import type { Message as VercelChatMessage } from 'ai';
import type { Document } from '@langchain/core/documents';
import { HumanMessage, AIMessage, ChatMessage } from '@langchain/core/messages';
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import { createRAGChain } from '@/utils/ragChain';
import { loadRetriever } from './vector_store';

const formatVercelMessages = (message: VercelChatMessage) => {
  if (message.role === 'user') return new HumanMessage(message.content);
  if (message.role === 'assistant') return new AIMessage(message.content);
  return new ChatMessage({ content: message.content, role: message.role });
};

export type RunChatOptions = {
  messages: VercelChatMessage[];
  documentIds: string[];
};

/**
 * Shared streaming-RAG handler. Returns a Response with `x-sources` and
 * `x-message-index` headers and a streamed text body, ready to hand back
 * from any route (private /api/chat or public /api/share/[token]/chat).
 */
export async function runChat({
  messages,
  documentIds,
}: RunChatOptions): Promise<Response> {
  let mongoDbClient: Awaited<ReturnType<typeof loadRetriever>>['mongoDbClient'];

  try {
    if (!messages.length) {
      return new Response(JSON.stringify({ error: 'No messages provided.' }), {
        status: 400,
      });
    }
    if (!documentIds.length) {
      return new Response(
        JSON.stringify({ error: 'No documentIds provided.' }),
        {
          status: 400,
        },
      );
    }

    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatVercelMessages);
    const currentMessageContent = messages[messages.length - 1].content;

    const model = new ChatTogetherAI({
      model: 'Qwen/Qwen3.5-9B',
      temperature: 0,
      modelKwargs: {
        chat_template_kwargs: { enable_thinking: false },
      },
    });

    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });

    const retrieverInfo = await loadRetriever({
      documentIds,
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents);
          },
        },
      ],
    });
    const retriever = retrieverInfo.retriever;
    mongoDbClient = retrieverInfo.mongoDbClient;

    const ragChain = await createRAGChain(model, retriever);

    const stream = await ragChain.stream({
      input: currentMessageContent,
      chat_history: formattedPreviousMessages,
    });

    const documents = await documentPromise;
    const serializedSources = Buffer.from(
      JSON.stringify(
        documents.map((doc) => ({
          // 220 chars instead of 50 — gives the citation popover enough copy
          // to be readable without having to round-trip back to the server.
          pageContent:
            doc.pageContent.slice(0, 220) +
            (doc.pageContent.length > 220 ? '…' : ''),
          metadata: doc.metadata,
        })),
      ),
    ).toString('base64');

    const byteStream = stream.pipeThrough(new TextEncoderStream());

    return new Response(byteStream, {
      headers: {
        'x-message-index': (formattedPreviousMessages.length + 1).toString(),
        'x-sources': serializedSources,
      },
    });
  } catch (e: any) {
    console.error('[runChat] Error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  } finally {
    if (mongoDbClient) {
      await mongoDbClient.close();
    }
  }
}
