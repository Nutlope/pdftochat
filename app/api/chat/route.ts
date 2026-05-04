import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/utils/prisma';
import { runChat } from '../utils/chatHandler';

// Chroma Cloud client and MongoDB both require Node.js runtime (not edge).
export const runtime =
  process.env.NEXT_PUBLIC_VECTORSTORE === 'mongodb' ||
  process.env.NEXT_PUBLIC_VECTORSTORE === 'chroma'
    ? 'nodejs'
    : 'edge';

/**
 * Stream a chat response. Body shape:
 * - { messages, chatId } — legacy single-doc path. `chatId` is the document id.
 * - { messages, chatId, documentIds } — multi-doc path. `chatId` may be a Chat
 *   row id (cross-doc chat) and `documentIds` carries the scope.
 */
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const messages = body.messages ?? [];
  const requestedIds: string[] = Array.isArray(body.documentIds)
    ? body.documentIds
    : body.chatId
    ? [body.chatId]
    : [];

  // Authorise every requested document — silently drop ids the user doesn't own.
  const owned = await prisma.document.findMany({
    where: { userId, id: { in: requestedIds } },
    select: { id: true },
  });
  const documentIds = owned.map((d) => d.id);

  if (documentIds.length === 0) {
    return NextResponse.json(
      { error: 'No accessible documents in scope.' },
      { status: 403 },
    );
  }

  return runChat({ messages, documentIds });
}
