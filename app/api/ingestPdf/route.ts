import prisma from '@/utils/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { RAGChat, togetherai } from '@upstash/rag-chat';
import { Index } from '@upstash/vector';
import { NextResponse } from 'next/server';

const ragchat = new RAGChat({
  vector: new Index(),
  // This model is not even being used for embedding conversion Upstash does that automatically.
  model: togetherai('togethercomputer/m2-bert-80M-8k-retrieval', {
    apiKey: process.env.TOGETHER_AI_API_KEY,
  }),
  debug: process.env.NODE_ENV == 'development',
});

export async function POST(request: Request) {
  const { fileUrl, fileName } = await request.json();
  const { userId } = getAuth(request as any);
  console.log({ fileUrl, fileName });
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

    await ragchat.context.add({
      fileSource: buffer,
      type: 'pdf',
      config: {
        chunkSize: 1000,
        chunkOverlap: 200,
      },
      options: { namespace },
    });
    console.log('creating vector store...');
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ error: 'Failed to ingest your data' });
  }
  return NextResponse.json({
    text: 'Successfully embedded pdf',
    id: namespace,
  });
}
