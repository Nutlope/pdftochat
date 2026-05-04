'use client';

import { UploadDropzone } from 'react-uploader';
import { Uploader } from 'uploader';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { FileText } from 'lucide-react';
import CommandPalette from '@/components/ui/CommandPalette';
import CrossDocDialog from '@/components/ui/CrossDocDialog';

const uploader = Uploader({
  apiKey: !!process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
    ? process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
    : 'no api key found',
});

export default function DashboardClient({ docsList }: { docsList: any }) {
  const router = useRouter();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [crossOpen, setCrossOpen] = useState(false);

  const visibleDocs = docsList.filter((doc: any) => !deletedIds.has(doc.id));
  const docsForPalette = visibleDocs.map((d: any) => ({
    id: d.id,
    fileName: d.fileName,
  }));

  const options = {
    maxFileCount: 1,
    mimeTypes: ['application/pdf'],
    editor: { images: { crop: false } },
    styles: {
      colors: { primary: '#1a1a1a', error: '#c0392b' },
    },
    onValidate: async (_file: File): Promise<undefined | string> => undefined,
  };

  async function ingestPdf(fileUrl: string, fileName: string) {
    setError(null);
    try {
      const res = await fetch('/api/ingestPdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl, fileName }),
      });
      const data = await res.json().catch(() => null);
      if (!data || data.error || !data.id) {
        setError(data?.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      await getToken({ skipCache: true });
      router.push(`/document/${data.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  async function deleteDoc(docId: string) {
    setDeletingId(docId);
    setDeletedIds((prev) => new Set(prev).add(docId));
    try {
      const res = await fetch(`/api/document/${docId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) {
        setDeletedIds((prev) => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
        setError(data.error);
      }
    } catch {
      setDeletedIds((prev) => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
      setError('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="shell" style={{ paddingBlock: 'var(--space-2xl)' }}>
      <header className="dash-head">
        <div>
          <p className="eyebrow">Your library</p>
          <h1 className="dash-head__title">
            {visibleDocs.length > 0
              ? 'Pick up where you left off, or upload another.'
              : 'Upload a PDF to start chatting.'}
          </h1>
        </div>
        <div className="dash-head__actions">
          {visibleDocs.length >= 2 && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setCrossOpen(true)}
            >
              New cross-doc chat
            </button>
          )}
          <kbd className="kbd-hint" title="Open command palette">
            ⌘K
          </kbd>
        </div>
      </header>

      {visibleDocs.length > 0 && (
        <div className="surface" style={{ marginBottom: 'var(--space-xl)' }}>
          <table className="doc-table">
            <thead>
              <tr>
                <th scope="col">Document</th>
                <th scope="col" className="doc-table__age">
                  Added
                </th>
                <th scope="col" className="doc-table__act">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleDocs.map((doc: any) => (
                <tr key={doc.id}>
                  <td>
                    <button
                      type="button"
                      className="doc-table__name"
                      onClick={() => router.push(`/document/${doc.id}`)}
                    >
                      <FileText size={14} aria-hidden="true" />
                      <span>{doc.fileName}</span>
                    </button>
                  </td>
                  <td className="doc-table__age tnum">
                    {formatDistanceToNow(doc.createdAt)} ago
                  </td>
                  <td className="doc-table__act">
                    <button
                      type="button"
                      className="btn btn--danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDoc(doc.id);
                      }}
                      disabled={deletingId !== null}
                    >
                      {deletingId === doc.id ? 'Removing…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <p
          role="alert"
          style={{
            color: 'var(--color-danger)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-md)',
          }}
        >
          {error}
        </p>
      )}

      <CommandPalette
        documents={docsForPalette}
        onCrossDocChat={() => setCrossOpen(true)}
      />
      <CrossDocDialog
        open={crossOpen}
        onClose={() => setCrossOpen(false)}
        documents={docsForPalette}
      />

      <div className="upload">
        <div className="upload__head">
          <p className="eyebrow">
            {visibleDocs.length > 0 ? 'Upload another' : 'Upload a PDF'}
          </p>
          <p className="upload__hint">PDF only · up to ~50&nbsp;MB</p>
        </div>
        <div className="upload__zone">
          {loading ? (
            <div className="upload__loading">
              <span className="dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span>Reading your PDF…</span>
            </div>
          ) : (
            <UploadDropzone
              uploader={uploader}
              options={options}
              onUpdate={(file) => {
                if (file.length !== 0) {
                  setLoading(true);
                  ingestPdf(
                    file[0].fileUrl,
                    file[0].originalFile.originalFileName || file[0].filePath,
                  );
                }
              }}
              width="100%"
              height="220px"
            />
          )}
        </div>
      </div>
    </section>
  );
}
