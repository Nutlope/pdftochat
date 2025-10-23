import { NextResponse } from 'next/server';
import { getAvailableDocuments } from '@/lib/document-scanner';

export async function GET() {
  try {
    const documents = await getAvailableDocuments();
    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    );
  }
}
