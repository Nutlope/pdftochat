import { NextResponse } from 'next/server';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { AIMessage, HumanMessage } from 'langchain/schema';
import { CONDENSE_TEMPLATE, QA_TEMPLATE } from '@/utils/config';
import { pinecone } from '@/utils/pinecone-client';
import { StreamingTextResponse } from 'ai';
import { BytesOutputParser } from 'langchain/schema/output_parser';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';

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

    const model = new ChatOpenAI({
      temperature: 0,
      modelName: 'gpt-3.5-turbo',
      streaming: true,
    });

    const outputParser = new BytesOutputParser();

    // Create a chain
    const chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(),
      {
        qaTemplate: QA_TEMPLATE,
        questionGeneratorTemplate: CONDENSE_TEMPLATE,
        // returnSourceDocuments: true, // # of source documents, 4 by default
      },
    );

    const pastMessages = history.map((message: string, i: number) => {
      if (i % 2 === 0) {
        return new HumanMessage(message);
      } else {
        return new AIMessage(message);
      }
    });

    // Ask a question using chat history
    const response = await chain.stream(
      {
        question: sanitizedQuestion,
        chat_history: pastMessages,
      },
      {
        callbacks: [
          {
            handleLLMNewToken(token: string) {
              console.log({ token });
            },
          },
        ],
      },
    );

    console.log('response', response);
    // return NextResponse.json(response);
    return new StreamingTextResponse(response);
  } catch (error: any) {
    console.log('error', error);
    return NextResponse.json({
      error: error.message || 'Something went wrong',
    });
  }
}
