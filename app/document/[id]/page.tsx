import prisma from '@/utils/prisma';
import { currentUser, type User } from '@clerk/nextjs/server';
import DocumentClient from './document-client';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
