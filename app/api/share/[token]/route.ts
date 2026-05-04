import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

/**
 * Public — fetches the document metadata for a shared link. No auth.
 * Returns the minimum the public viewer needs (no userId, no created date,
 * just enough to render the page + chat).
 */
export async function GET(
  _request: Request,
  { params }: { params: { token: string } },
) {
  if (!params.token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const doc = await prisma.document.findUnique({
    where: { shareToken: params.token },
    select: {
      id: true,
      fileName: true,
      fileUrl: true,
      suggestedQuestions: true,
    },
  });

  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(doc);
}
