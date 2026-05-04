import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { runChat } from '../../../utils/chatHandler';

export const runtime =
  process.env.NEXT_PUBLIC_VECTORSTORE === 'mongodb' ||
  process.env.NEXT_PUBLIC_VECTORSTORE === 'chroma'
    ? 'nodejs'
    : 'edge';

/**
 * Public chat endpoint scoped to a shared document. Validates the token,
 * locks documentIds to the single shared doc, then delegates to runChat.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  if (!params.token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const doc = await prisma.document.findUnique({
    where: { shareToken: params.token },
    select: { id: true },
  });

  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const messages = body.messages ?? [];

  // Public viewers never get to widen the scope — single doc only.
  return runChat({ messages, documentIds: [doc.id] });
}
