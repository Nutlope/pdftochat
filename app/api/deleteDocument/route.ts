import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { Pinecone } from '@pinecone-database/pinecone';

interface DeleteFileParams {
  accountId: string;
  apiKey: string;
  querystring: {
    filePath: string;
  };
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY ?? '',
  environment: process.env.PINECONE_ENVIRONMENT ?? '',
});

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('Missing Pinecone index name in .env file');
}

async function deleteFile(params: DeleteFileParams) {
  const baseUrl = 'https://api.bytescale.com';
  const path = `/v2/accounts/${params.accountId}/files`;
  const entries = (obj: Record<string, unknown>) =>
    Object.entries(obj).filter(([, val]) => (val ?? null) !== null) as [
      string,
      string,
    ][];
  const query = entries(params.querystring ?? {})
    .flatMap(([k, v]) => (Array.isArray(v) ? v.map((v2) => [k, v2]) : [[k, v]]))
    .map((kv) => kv.join('='))
    .join('&');
  const response = await fetch(
    `${baseUrl}${path}${query.length > 0 ? '?' : ''}${query}`,
    {
      method: 'DELETE',
      headers: Object.fromEntries(
        entries({
          Authorization: `Bearer ${params.apiKey}`,
        }) as [string, string][],
      ),
    },
  );
  if (Math.floor(response.status / 100) !== 2) {
    const result = await response.json();
    throw new Error(`Bytescale API Error: ${JSON.stringify(result)}`);
  }
}

export async function DELETE(request: Request) {
  const { id, fileUrl } = await request.json();

  const { userId } = getAuth(request as any);

  if (!userId) {
    return NextResponse.json({ error: 'You must be logged in to delete data' });
  }

  try {
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' });
    }

    const pathWithAccId = fileUrl.replace('https://upcdn.io/', '');
    const accId = pathWithAccId.split('/')[0];
    const path = pathWithAccId.replace(`${accId}/raw`, '');

    deleteFile({
      accountId: accId,
      apiKey: !!process.env.NEXT_SECRET_BYTESCALE_API_KEY
        ? process.env.NEXT_SECRET_BYTESCALE_API_KEY
        : 'no api key found',
      querystring: {
        filePath: path,
      },
    }).then(
      () => console.log('Success.'),
      (error) => {
        console.error(error);
        return NextResponse.json({
          error: 'Could not delete document from cloud',
        });
      },
    );

    const index = pinecone.Index(PINECONE_INDEX_NAME);

    try {
      await index.namespace(id).deleteAll();
    } catch (error) {
      console.log(error);
    }

    await prisma.document.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ text: 'Document deleted successfully', id });
  } catch (error) {
    console.log('error', error);
    return NextResponse.json({ error: 'Failed to delete your data' });
  }
}
