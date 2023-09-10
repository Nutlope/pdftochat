import { NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('Missing Pinecone index name in .env file');
}

export async function POST(request: Request) {
  let namespace = (+new Date()).toString(36); // TODO: Change this to include user id as well
  const { fileUrl } = await request.json();

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

    console.log('split docs', docs);
    console.log('creating vector store...');

    /* create and store the embeddings in the vectorStore */
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); // change to your own index name

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
