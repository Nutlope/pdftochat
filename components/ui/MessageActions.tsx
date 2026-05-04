'use client';

import { useState } from 'react';
import { Check, Copy, Quote, RotateCw } from 'lucide-react';

type Source = {
  pageContent: string;
  metadata: Record<string, any>;
};

type Props = {
  text: string;
  sources?: Source[];
  isLast: boolean;
  isLoading: boolean;
  onRegenerate: () => void;
};

const COPY_RESET_MS = 2500;

export default function MessageActions({
  text,
  sources,
  isLast,
  isLoading,
  onRegenerate,
}: Props) {
  const [copied, setCopied] = useState<'msg' | 'cite' | null>(null);

  async function copyMessage() {
    await navigator.clipboard.writeText(text);
    setCopied('msg');
    window.setTimeout(() => setCopied(null), COPY_RESET_MS);
  }

  async function copyCitation() {
    const pages = (sources ?? [])
      .map((s) => s.metadata?.['loc.pageNumber'] ?? s.metadata?.loc?.pageNumber)
      .filter((n): n is number => typeof n === 'number');
    const unique = Array.from(new Set(pages));
    const footer = unique.length
      ? `\n\n— Sources: ${unique.map((p) => `p. ${p}`).join(', ')}`
      : '';
    const blockquote = text
      .split('\n')
      .map((l) => (l ? `> ${l}` : '>'))
      .join('\n');
    await navigator.clipboard.writeText(blockquote + footer);
    setCopied('cite');
    window.setTimeout(() => setCopied(null), COPY_RESET_MS);
  }

  return (
    <div className="msg-actions" aria-label="Message actions">
      <button
        type="button"
        className="msg-actions__btn"
        onClick={copyMessage}
        title="Copy reply"
      >
        {copied === 'msg' ? (
          <Check size={13} aria-hidden="true" />
        ) : (
          <Copy size={13} aria-hidden="true" />
        )}
        <span>{copied === 'msg' ? 'Copied' : 'Copy'}</span>
      </button>

      <button
        type="button"
        className="msg-actions__btn"
        onClick={onRegenerate}
        disabled={isLoading || !isLast}
        title={
          isLast
            ? 'Regenerate this reply'
            : 'Only the last reply can be regenerated'
        }
      >
        <RotateCw size={13} aria-hidden="true" />
        <span>Regenerate</span>
      </button>

      <button
        type="button"
        className="msg-actions__btn"
        onClick={copyCitation}
        title="Copy as citation (markdown blockquote + sources)"
      >
        {copied === 'cite' ? (
          <Check size={13} aria-hidden="true" />
        ) : (
          <Quote size={13} aria-hidden="true" />
        )}
        <span>{copied === 'cite' ? 'Copied' : 'Cite'}</span>
      </button>
    </div>
  );
}
