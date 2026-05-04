import prisma from '@/utils/prisma';
import Link from 'next/link';
import { currentUser } from '@clerk/nextjs';
import type { User } from '@clerk/nextjs/api';
import DocumentClient from './document-client';

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { multi?: string };
}) {
  const user: User | null = await currentUser();
  if (!user) return notFound();

  const isMulti = searchParams?.multi === '1';

  // Multi-doc chat: params.id is a Chat row, not a Document row.
  if (isMulti) {
    const chat = await prisma.chat.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        scope: { include: { document: true } },
      },
    });
    if (!chat || chat.scope.length === 0) return notFound();

    const anchorScope = chat.scope[0];
    const anchorDoc = anchorScope.document;
    const library = await prisma.document.findMany({
      where: { userId: user.id },
      select: { id: true, fileName: true },
      orderBy: { createdAt: 'desc' },
    });

    return (
      <DocumentClient
        currentDoc={{ ...anchorDoc, id: chat.id }}
        anchorDocId={anchorDoc.id}
        library={library}
        initialDocumentIds={chat.scope.map((s) => s.documentId)}
        userImage={user?.imageUrl}
      />
    );
  }

  // Legacy single-doc path: params.id is a Document.
  const currentDoc = await prisma.document.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!currentDoc) return notFound();

  const library = await prisma.document.findMany({
    where: { userId: user.id },
    select: { id: true, fileName: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DocumentClient
      currentDoc={currentDoc}
      library={library}
      userImage={user?.imageUrl}
    />
  );
}

function notFound() {
  return (
    <section className="auth">
      <div className="auth__inner">
        <p className="eyebrow">404</p>
        <h1>This document wasn’t found.</h1>
        <p>It may have been deleted, or it belongs to a different account.</p>
        <Link href="/dashboard" className="btn btn--primary">
          Back to your library
        </Link>
      </div>
    </section>
  );
}
