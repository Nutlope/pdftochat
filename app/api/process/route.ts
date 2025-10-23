import { NextResponse } from 'next/server';
import { processDocuments } from '@/lib/pdf-processor';
import { sessionManager } from '@/lib/session-manager';

export async function POST(request: Request) {
  try {
    const { documentIds } = await request.json();

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one document' },
        { status: 400 }
      );
    }

    console.log(`Processing documents:`, documentIds);

    // Process documents and create vector store
    const { vectorStore, documents } = await processDocuments(documentIds);

    // Create session
    const sessionId = sessionManager.createSession(documentIds, vectorStore, documents);

    console.log(`Session created: ${sessionId}`);

    return NextResponse.json({
      sessionId,
      documentIds,
      documentCount: documents.length,
      message: 'Documents processed successfully'
    });

  } catch (error) {
    console.error('Error processing documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process documents' },
      { status: 500 }
    );
  }
}
