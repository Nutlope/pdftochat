import { NextResponse } from 'next/server';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import prisma from '@/utils/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { loadEmbeddingsModel } from '../utils/embeddings';
import { loadVectorStore } from '../utils/vector_store';
import { type MongoClient } from 'mongodb';

export async function POST(request: Request) {
  let mongoDbClient: MongoClient | null = null;

  const { fileUrl, fileName, vectorStoreId } = await request.json();

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
    const splitDocs = await textSplitter.splitDocuments(rawDocs);
    // Necessary for Mongo - we'll query on this later.
    for (const splitDoc of splitDocs) {
      splitDoc.metadata.docstore_document_id = namespace;
    }


    /* create and store the embeddings in the vectorStore */
    const embeddings = loadEmbeddingsModel();
    const store = await loadVectorStore({
      namespace: doc.id,
      embeddings,
    });

    const vectorstore = store.vectorstore;
    if ('mongoDbClient' in store) {
      mongoDbClient = store.mongoDbClient;
    }

    // embed the PDF documents
    await vectorstore.addDocuments(splitDocs);
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ error: 'Failed to ingest your data' });
  } finally {
    if (mongoDbClient) {
      await mongoDbClient.close();
    }
  }

  return NextResponse.json({
    text: 'Successfully embedded pdf',
    id: namespace,
  });
}

export async function DELETE(request: Request) {
  const DbStore = process.env.NEXT_PUBLIC_VECTORSTORE;
  let mongoDbClient: MongoClient | null = null;

  const { id } = await request.json();
  console.log(id)
  console.log("\n\n\n")
  const { userId } = getAuth(request as any);

  if (!userId) {
    return NextResponse.json({ error: 'You must be logged in to delete data' });
  }

  // Fetch the document to ensure it exists and belongs to the user
  const doc = await prisma.document.findUnique({
    where: {
      id,
    },
  });
  console.log(doc)
  console.log("\n\n\n")

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' });
  }

  if (doc.userId !== userId) {
    return NextResponse.json({ error: 'Unauthorized to delete this document' });
  }

  try {
    // Load the vector store

    const embeddings = loadEmbeddingsModel();
    console.log(embeddings)
    console.log("\n\n\n")
    const store = await loadVectorStore({ namespace: id, embeddings });

    console.log(store)
    console.log("\n\n\n")



    const vectorstore = store.vectorstore;
    console.log(vectorstore)
    console.log("\n\n\n")
    //@ts-ignore
    const collection = store.collection;
    console.log(collection)
    console.log("\n\n\n")
    if ('mongoDbClient' in store) {
      mongoDbClient = store.mongoDbClient;
    }

    if (DbStore === "mongodb") {
      // console.log("working");
      //@ts-ignore
      const { collection } = store;
      await collection.deleteMany({ 'metadata.docstore_document_id': id });
    } else {
      // For other vector stores, use their specific delete method
      // Delete embeddings from the vector store
      await vectorstore.delete({ namespace: id });
    }

    // Delete the document from the Prisma database
    await prisma.document.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ error: 'Failed to delete embeddings and document' });
  } finally {
    if (mongoDbClient) {
      await mongoDbClient.close();
    }
  }

  return NextResponse.json({
    message: 'Successfully deleted document and embeddings',
    id,
  });
}
