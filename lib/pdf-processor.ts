import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from 'langchain/document';
import { getDocumentPath } from './document-scanner';
import * as fs from 'fs';

export interface ProcessingResult {
  vectorStore: MemoryVectorStore;
  documents: Document[];
  documentIds: string[];
}

/**
 * Process selected PDFs and create an in-memory vector store
 */
export async function processDocuments(documentIds: string[]): Promise<ProcessingResult> {
  console.log(`Processing ${documentIds.length} documents...`);

  const allDocuments: Document[] = [];

  // Load and process each PDF
  for (const docId of documentIds) {
    try {
      const pdfPath = getDocumentPath(docId);

      if (!fs.existsSync(pdfPath)) {
        console.error(`Document not found: ${pdfPath}`);
        continue;
      }

      // Load PDF
      const loader = new PDFLoader(pdfPath);
      const rawDocs = await loader.load();

      // Add document metadata
      rawDocs.forEach(doc => {
        doc.metadata.documentId = docId;
        doc.metadata.documentName = `${docId}.pdf`;
      });

      allDocuments.push(...rawDocs);
      console.log(`Loaded ${rawDocs.length} pages from ${docId}.pdf`);
    } catch (error) {
      console.error(`Error loading document ${docId}:`, error);
    }
  }

  if (allDocuments.length === 0) {
    throw new Error('No documents were successfully loaded');
  }

  // Split text into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(allDocuments);
  console.log(`Split into ${splitDocs.length} chunks`);

  // Create embeddings
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Create in-memory vector store
  console.log('Creating vector store...');
  const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
  console.log('Vector store created successfully');

  return {
    vectorStore,
    documents: splitDocs,
    documentIds
  };
}
