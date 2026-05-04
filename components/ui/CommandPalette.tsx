'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

type Doc = { id: string; fileName: string };

type Item = {
  id: string;
  label: string;
  hint?: string;
  group: 'documents' | 'actions';
  run: () => void;
};

type Props = {
  documents: Doc[];
  onClose?: () => void;
  /** Optional callback for "New cross-doc chat" — falls back to /dashboard */
  onCrossDocChat?: () => void;
};

/**
 * Linear / Raycast-style command palette. Trigger ⌘K (or Ctrl+K) anywhere
 * to open. Arrow keys move the highlight; Enter runs the item; Esc closes.
 *
 * The dialog uses native <dialog> (focus-trap + ::backdrop come for free)
 * with `inert` on the body underneath. No backdrop animation in
 * reduced-motion mode.
 */
export default function CommandPalette({
  documents,
  onClose,
  onCrossDocChat,
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Trigger
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isPaletteShortcut =
        (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey);
      if (isPaletteShortcut) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } else if (!open && dialog.open) {
      dialog.close();
      setQuery('');
      setActiveIndex(0);
      onClose?.();
    }
  }, [open, onClose]);

  const items: Item[] = useMemo(() => {
    const docItems: Item[] = documents.map((d) => ({
      id: `doc-${d.id}`,
      label: d.fileName,
      hint: 'Open document',
      group: 'documents',
      run: () => {
        setOpen(false);
        router.push(`/document/${d.id}`);
      },
    }));

    const actionItems: Item[] = [
      {
        id: 'new-cross',
        label: 'New cross-doc chat…',
        hint: 'Pick documents to chat across',
        group: 'actions',
        run: () => {
          setOpen(false);
          onCrossDocChat?.();
        },
      },
      {
        id: 'go-dashboard',
        label: 'Go to library',
        hint: '/dashboard',
        group: 'actions',
        run: () => {
          setOpen(false);
          router.push('/dashboard');
        },
      },
      {
        id: 'go-home',
        label: 'Go to home',
        hint: '/',
        group: 'actions',
        run: () => {
          setOpen(false);
          router.push('/');
        },
      },
    ];

    const all = [...docItems, ...actionItems];
    if (!query.trim()) return all;

    const needle = query.toLowerCase();
    return all.filter((i) => i.label.toLowerCase().includes(needle));
  }, [documents, query, router, onCrossDocChat]);

  // Keep activeIndex in range as items shrink/grow.
  useEffect(() => {
    if (activeIndex >= items.length) setActiveIndex(0);
  }, [items.length, activeIndex]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[activeIndex]?.run();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="palette"
      onClick={(e) => {
        // Click on backdrop (the dialog itself) closes; clicks inside the
        // card bubble up but don't match the dialog as target.
        if (e.target === dialogRef.current) setOpen(false);
      }}
      onClose={() => setOpen(false)}
    >
      <div className="palette__card" onKeyDown={handleKeyDown}>
        <div className="palette__head">
          <Search size={14} aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a document, run an action…"
            className="palette__input"
            aria-label="Command palette search"
            spellCheck={false}
          />
          <kbd className="palette__kbd">esc</kbd>
        </div>

        <ul className="palette__list" role="listbox">
          {items.length === 0 && (
            <li className="palette__empty">No matches.</li>
          )}
          {items.map((item, i) => (
            <li
              key={item.id}
              className={
                'palette__item' +
                (i === activeIndex ? ' palette__item--active' : '')
              }
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => item.run()}
            >
              <span className="palette__group">
                {item.group === 'documents' ? 'Doc' : 'Go'}
              </span>
              <span className="palette__label">{item.label}</span>
              {item.hint && <span className="palette__hint">{item.hint}</span>}
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
