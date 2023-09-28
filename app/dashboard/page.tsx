import DashboardClient from './dashboard-client';
import prisma from '@/utils/prisma';
import { currentUser } from '@clerk/nextjs';
import type { User } from '@clerk/nextjs/api';

export default async function Page() {
  const user: User | null = await currentUser();

  const docsList = await prisma.document.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <DashboardClient docsList={docsList} />
    </div>
  );
}
