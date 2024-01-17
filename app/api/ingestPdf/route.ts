import { NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { TogetherAIEmbeddings } from '@langchain/community/embeddings/togetherai';
import { PineconeStore } from '@langchain/community/vectorstores/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import prisma from '@/utils/prisma';
import { getAuth } from '@clerk/nextjs/server';

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY ?? '',
  environment: process.env.PINECONE_ENVIRONMENT ?? '', //this is in the dashboard
});

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('Missing Pinecone index name in .env file');
}

export async function POST(request: Request) {
  const { fileUrl, fileName } = await request.json();

  const { userId } = getAuth(request as any);

  if (!userId) {
    return NextResponse.json({ error: 'You must be logged in to ingest data' });
  }

  const docAmount = await prisma.document.count({
    where: {
      userId,
    },
  });

  if (docAmount > 3) {
    return NextResponse.json({
      error: 'You have reached the maximum number of documents',
    });
  }

  const doc = await prisma.document.create({
    data: {
      fileName,
      fileUrl,
      userId,
    },
  });

  const namespace = doc.id;

  try {
    /* load from remote pdf URL */
    const response = await fetch(fileUrl);
    const buffer = await response.blob();
    const loader = new PDFLoader(buffer);
    const rawDocs = await loader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.splitDocuments(rawDocs);

    console.log('creating vector store...');

    /* create and store the embeddings in the vectorStore */
    const embeddings = new TogetherAIEmbeddings({
      apiKey: process.env.TOGETHER_AI_API_KEY,
      modelName: 'togethercomputer/m2-bert-80M-8k-retrieval',
    });
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    // embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace,
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ error: 'Failed to ingest your data' });
  }

  return NextResponse.json({
    text: 'Successfully embedded pdf',
    id: namespace,
  });
}
