'use client';

import { useEffect, useRef, useState } from 'react';
import { Share2 } from 'lucide-react';

type Props = {
  /** The Document.id (NOT a Chat id). Share is per-document, single doc only. */
  documentId: string;
  /** Initial token for SSR; updates after toggle. */
  initialToken?: string | null;
};

export default function SharePopover({
  documentId,
  initialToken = null,
}: Props) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(initialToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  async function toggle(enabled: boolean) {
    setLoading(true);
    try {
      const res = await fetch(`/api/document/${documentId}/share`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      setToken(data.shareToken ?? null);
    } catch {
      // surface nothing — silent failure leaves toggle in original state
    } finally {
      setLoading(false);
    }
  }

  const url =
    token && typeof window !== 'undefined'
      ? `${window.location.origin}/share/${token}`
      : null;

  async function copyUrl() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="share-pop" ref={wrapRef}>
      <button
        type="button"
        className="btn btn--ghost"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Share2 size={13} aria-hidden="true" />
        <span>Share</span>
      </button>
      {open && (
        <div
          className="share-pop__panel"
          role="dialog"
          aria-label="Share document"
        >
          <div className="share-pop__row">
            <div>
              <p className="share-pop__title">Public link</p>
              <p className="share-pop__sub">
                Anyone with the link can read &amp; chat with this document.
              </p>
            </div>
            <Switch checked={!!token} disabled={loading} onChange={toggle} />
          </div>

          {url ? (
            <div className="share-pop__urlrow">
              <input
                type="text"
                className="share-pop__url"
                value={url}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
              />
              <button
                type="button"
                className="btn btn--secondary share-pop__copy"
                onClick={copyUrl}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          ) : (
            <p className="share-pop__hint">
              Toggle on to mint a link. Toggle off to revoke it.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Switch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={'switch' + (checked ? ' switch--on' : '')}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__handle" aria-hidden="true" />
    </button>
  );
}
