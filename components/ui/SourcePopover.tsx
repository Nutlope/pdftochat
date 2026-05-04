'use client';

import { useEffect, useId, useRef, useState } from 'react';

type Props = {
  pageNumber: number;
  excerpt: string;
  onJump: () => void;
};

/**
 * Citation chip with a hover/focus popover that shows the source excerpt
 * and a "Jump to page" link.
 *
 * Hover delay 800 ms (per design.md) so the popover doesn't flash on
 * casual mouse movement; focus delay 0 ms because keyboard users
 * deliberately reached this chip.
 */
export default function SourcePopover({ pageNumber, excerpt, onJump }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const enterTimer = useRef<number | null>(null);
  const popId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function clearEnter() {
    if (enterTimer.current !== null) {
      window.clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }
  }

  return (
    <span
      ref={wrapRef}
      className="src"
      onMouseEnter={() => {
        clearEnter();
        enterTimer.current = window.setTimeout(() => setOpen(true), 800);
      }}
      onMouseLeave={() => {
        clearEnter();
        setOpen(false);
      }}
    >
      <button
        type="button"
        className="bubble__source"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popId}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          // Keep open if focus moved into the popover content.
          if (
            !e.currentTarget.parentElement?.contains(e.relatedTarget as Node)
          ) {
            setOpen(false);
          }
        }}
        onClick={onJump}
      >
        p. {pageNumber}
      </button>
      {open && (
        <span
          id={popId}
          role="dialog"
          aria-label={`Source excerpt from page ${pageNumber}`}
          className="src__pop"
        >
          <span className="src__pop-eyebrow">From page {pageNumber}</span>
          <span className="src__pop-body">{excerpt}</span>
          <button
            type="button"
            className="src__pop-jump"
            onClick={onJump}
            tabIndex={0}
          >
            Jump to page →
          </button>
        </span>
      )}
    </span>
  );
}
