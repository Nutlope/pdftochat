import { NextResponse } from 'next/server';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('Missing Pinecone index name in .env file');
}

export async function POST(request: Request) {
  const { question, history, chatId } = await request.json();

  if (!question) {
    return NextResponse.json({ message: 'No question in the request' });
  }

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: chatId,
      },
    );

    // Create chain
    const chain = makeChain(vectorStore);

    const pastMessages = history.map((message: string, i: number) => {
      if (i % 2 === 0) {
        return new HumanMessage(message);
      } else {
        return new AIMessage(message);
      }
    });

    // Ask a question using chat history
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: pastMessages,
    });

    console.log('response', response);
    return NextResponse.json(response);
  } catch (error: any) {
    console.log('error', error);
    return NextResponse.json({
      error: error.message || 'Something went wrong',
    });
  }
}
