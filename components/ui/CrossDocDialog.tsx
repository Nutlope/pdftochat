'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Doc = { id: string; fileName: string };

type Props = {
  open: boolean;
  onClose: () => void;
  documents: Doc[];
};

/**
 * Two-step modal for starting a cross-doc chat.
 *   Step 1 — pick documents (≥ 2)
 *   Step 2 — confirm + name (optional), POST /api/chats, navigate
 */
export default function CrossDocDialog({ open, onClose, documents }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      setPicked(new Set());
      setTitle('');
    }
  }, [open]);

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function start() {
    const ids = Array.from(picked);
    if (ids.length < 2) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ documentIds: ids, title: title || undefined }),
      });
      const data = await res.json();
      if (data.chatId) {
        onClose();
        router.push(`/document/${data.chatId}?multi=1`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="cross-dialog"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      onClose={onClose}
    >
      <div className="cross-dialog__card">
        <header className="cross-dialog__head">
          <p className="eyebrow">New chat</p>
          <h2 className="cross-dialog__title">Chat across documents</h2>
          <p className="cross-dialog__sub">
            Pick two or more — the assistant will retrieve from all of them.
          </p>
        </header>

        <ul className="cross-dialog__list">
          {documents.map((d) => {
            const checked = picked.has(d.id);
            return (
              <li key={d.id}>
                <label className="cross-dialog__item">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(d.id)}
                  />
                  <span>{d.fileName}</span>
                </label>
              </li>
            );
          })}
          {documents.length === 0 && (
            <li className="cross-dialog__empty">
              You need at least two indexed documents to start a cross-doc chat.
            </li>
          )}
        </ul>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chat name (optional)"
          className="field"
          maxLength={80}
        />

        <footer className="cross-dialog__foot">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={picked.size < 2 || submitting}
            onClick={start}
          >
            Start chat ({picked.size})
          </button>
        </footer>
      </div>
    </dialog>
  );
}
