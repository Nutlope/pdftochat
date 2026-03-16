import { NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import prisma from '@/utils/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { loadEmbeddingsModel } from '../utils/embeddings';
import { loadVectorStore } from '../utils/vector_store';

export async function POST(request: Request) {
  console.log('[ingestPdf] POST handler started');

  const { fileUrl, fileName, vectorStoreId } = await request.json();
  console.log('[ingestPdf] Received:', { fileUrl: fileUrl?.slice(0, 80), fileName, vectorStoreId });

  const { userId } = getAuth(request as any);
  console.log('[ingestPdf] Auth userId:', userId);

  if (!userId) {
    console.log('[ingestPdf] No userId, returning 401');
    return NextResponse.json({ error: 'You must be logged in to ingest data' });
  }

  const docAmount = await prisma.document.count({
    where: {
      userId,
    },
  });
  console.log('[ingestPdf] Existing doc count:', docAmount);

  if (process.env.NODE_ENV === 'production' && docAmount > 3) {
    console.log('[ingestPdf] Doc limit reached, returning error');
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
  console.log('[ingestPdf] Created doc in DB:', { id: doc.id, fileName: doc.fileName });

  const namespace = doc.id;

  try {
    /* load from remote pdf URL */
    console.log('[ingestPdf] Fetching PDF from URL...');
    const response = await fetch(fileUrl);
    console.log('[ingestPdf] PDF fetch status:', response.status);
    const buffer = await response.blob();
    console.log('[ingestPdf] PDF blob size:', buffer.size);
    const loader = new PDFLoader(buffer);
    const rawDocs = await loader.load();
    console.log('[ingestPdf] Loaded PDF pages:', rawDocs.length);

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(rawDocs);
    console.log('[ingestPdf] Split into chunks:', splitDocs.length);
    // Necessary for Mongo - we'll query on this later.
    for (const splitDoc of splitDocs) {
      splitDoc.metadata.docstore_document_id = namespace;
    }

    console.log('[ingestPdf] Creating vector store...', { vectorStoreEnv: process.env.NEXT_PUBLIC_VECTORSTORE });

    /* create and store the embeddings in the vectorStore */
    const embeddings = loadEmbeddingsModel();

    const store = await loadVectorStore({
      namespace: doc.id,
      embeddings,
    });
    console.log('[ingestPdf] Vector store loaded');
    const vectorstore = store.vectorstore;

    await vectorstore.addDocuments(splitDocs);
    console.log('[ingestPdf] Documents added to vector store');
  } catch (error) {
    console.error('[ingestPdf] Error during ingestion:', error);
    return NextResponse.json({ error: 'Failed to ingest your data' });
  }

  console.log('[ingestPdf] Success, returning id:', namespace);
  return NextResponse.json({
    text: 'Successfully embedded pdf',
    id: namespace,
  });
}
