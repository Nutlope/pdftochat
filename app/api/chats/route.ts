import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/utils/prisma';

/**
 * POST /api/chats
 *
 * Mints a multi-document Chat row + ChatScope joins. Returns the chatId,
 * which the client uses to navigate to /document/[chatId]?multi=1 — the
 * same chat surface, but the scope picker pre-fills with the selected docs.
 *
 * Body: { documentIds: string[]; title?: string }
 */
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { documentIds, title } = (await req.json()) as {
    documentIds?: unknown;
    title?: unknown;
  };

  if (!Array.isArray(documentIds) || documentIds.length === 0) {
    return NextResponse.json(
      { error: 'documentIds must be a non-empty array.' },
      { status: 400 },
    );
  }
  const ids = documentIds.filter((x): x is string => typeof x === 'string');

  // Authorise: every requested doc must belong to the user.
  const owned = await prisma.document.findMany({
    where: { userId, id: { in: ids } },
    select: { id: true },
  });
  if (owned.length !== ids.length) {
    return NextResponse.json(
      { error: 'One or more documents not accessible.' },
      { status: 403 },
    );
  }

  const chat = await prisma.chat.create({
    data: {
      userId,
      title: typeof title === 'string' && title.trim() ? title.trim() : null,
      scope: {
        create: ids.map((documentId) => ({ documentId })),
      },
    },
  });

  return NextResponse.json({ chatId: chat.id });
}
