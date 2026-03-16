import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/utils/prisma';
import { deleteChromaCollection } from '../../utils/vector_store/chroma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { userId } = getAuth(request as any);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const docId = params.id;

  const doc = await prisma.document.findUnique({ where: { id: docId } });

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  if (doc.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    if (process.env.NEXT_PUBLIC_VECTORSTORE === 'chroma') {
      await deleteChromaCollection(docId).catch((e) => {
        // Collection may not exist if ingest failed or was never completed
        console.warn('[document/delete] Chroma collection not found, skipping:', e.message);
      });
    }
    await prisma.document.delete({ where: { id: docId } });
  } catch (e) {
    console.error('[document/delete] Error:', e);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
