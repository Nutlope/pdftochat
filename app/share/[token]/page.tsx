import Link from 'next/link';
import prisma from '@/utils/prisma';
import DocumentClient from '@/app/document/[id]/document-client';
import Logo from '@/components/ui/Logo';

export default async function SharePage({
  params,
}: {
  params: { token: string };
}) {
  const doc = await prisma.document.findUnique({
    where: { shareToken: params.token },
  });

  if (!doc) {
    return (
      <div className="page">
        <header className="shell" style={{ padding: 'var(--space-md) 0' }}>
          <Logo />
        </header>
        <section className="auth">
          <div className="auth__inner">
            <p className="eyebrow">404</p>
            <h1>This shared link is no longer active.</h1>
            <p>The owner may have revoked it.</p>
            <Link href="/" className="btn btn--primary">
              Visit PDFtoChat
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="app-nav">
        <div className="shell app-nav__inner">
          <Logo />
          <Link href="/sign-up" className="btn btn--primary">
            Try PDFtoChat
          </Link>
        </div>
      </header>
      <DocumentClient
        currentDoc={doc}
        shareToken={params.token}
        userImage={undefined}
      />
    </div>
  );
}
