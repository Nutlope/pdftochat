import prisma from '@/utils/prisma';
import { currentUser } from '@clerk/nextjs';
import type { User } from '@clerk/nextjs/api';
import DocumentClient from './document-client';

export default async function Page({ params }: { params: { id: string } }) {
  const user: User | null = await currentUser();

  const currentDoc = await prisma.document.findFirst({
    where: {
      id: params.id,
      userId: user?.id,
    },
  });

  if (!currentDoc) {
    return <div>This document was not found</div>;
  }

  return (
    <div>
      <DocumentClient currentDoc={currentDoc} userImage={user?.imageUrl} />
    </div>
  );
}
