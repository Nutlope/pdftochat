import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/utils/prisma';

/**
 * Lightweight list of the signed-in user's documents — used by the command
 * palette and the cross-doc scope picker. Returns id + filename + age only.
 */
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const docs = await prisma.document.findMany({
    where: { userId },
    select: { id: true, fileName: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ documents: docs });
}
