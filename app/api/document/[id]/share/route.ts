import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import prisma from '@/utils/prisma';

/**
 * Toggle a public share link for a document the user owns.
 * Body: { enabled: boolean }
 * Returns: { shareToken: string | null }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const owned = await prisma.document.findFirst({
    where: { id: params.id, userId },
    select: { id: true, shareToken: true },
  });
  if (!owned) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { enabled } = (await req.json()) as { enabled?: boolean };

  if (enabled === false) {
    await prisma.document.update({
      where: { id: owned.id },
      data: { shareToken: null },
    });
    return NextResponse.json({ shareToken: null });
  }

  // Re-use an existing token when one is already set; only mint a new one
  // the first time the user enables sharing.
  const shareToken = owned.shareToken ?? randomUUID();
  if (!owned.shareToken) {
    await prisma.document.update({
      where: { id: owned.id },
      data: { shareToken },
    });
  }
  return NextResponse.json({ shareToken });
}
