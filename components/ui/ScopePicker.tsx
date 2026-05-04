'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';

type Doc = { id: string; fileName: string };

type Props = {
  /** All docs in the user's library (used to populate the picker). */
  library: Doc[];
  /** The doc that anchors this chat — never removable. */
  anchor: Doc;
  /** Currently selected doc ids (always includes anchor.id). */
  selected: string[];
  onChange: (ids: string[]) => void;
};

/**
 * Scope picker that sits above the composer. Shows the anchor doc as a
 * fixed chip + each additional scoped doc as a removable chip + a "+ Add"
 * affordance that opens a small dropdown of the rest of the library.
 */
export default function ScopePicker({
  library,
  anchor,
  selected,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
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

  const selectedSet = new Set(selected);
  const others = library.filter((d) => d.id !== anchor.id);

  function toggle(id: string) {
    if (selectedSet.has(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function remove(id: string) {
    if (id === anchor.id) return;
    onChange(selected.filter((x) => x !== id));
  }

  const otherChips = selected
    .filter((id) => id !== anchor.id)
    .map((id) => library.find((d) => d.id === id))
    .filter((d): d is Doc => !!d);

  return (
    <div className="scope">
      <span className="scope__label">Scope</span>
      <ul className="scope__chips">
        <li className="scope__chip scope__chip--anchor" title={anchor.fileName}>
          <FileText size={11} aria-hidden="true" />
          <span className="scope__chip-name">{shorten(anchor.fileName)}</span>
        </li>
        {otherChips.map((doc) => (
          <li className="scope__chip" key={doc.id} title={doc.fileName}>
            <FileText size={11} aria-hidden="true" />
            <span className="scope__chip-name">{shorten(doc.fileName)}</span>
            <button
              type="button"
              className="scope__chip-x"
              aria-label={`Remove ${doc.fileName} from scope`}
              onClick={() => remove(doc.id)}
            >
              <X size={12} aria-hidden="true" />
            </button>
          </li>
        ))}
        {others.length > otherChips.length && (
          <li className="scope__add-wrap" ref={dropdownRef}>
            <button
              type="button"
              className="scope__add"
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <Plus size={11} aria-hidden="true" />
              Add
            </button>
            {open && (
              <div className="scope__menu" role="listbox">
                {others.map((d) => {
                  const checked = selectedSet.has(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      role="option"
                      aria-selected={checked}
                      className={
                        'scope__menu-item' +
                        (checked ? ' scope__menu-item--checked' : '')
                      }
                      onClick={() => toggle(d.id)}
                    >
                      <span className="scope__menu-check" aria-hidden="true">
                        {checked ? '✓' : ''}
                      </span>
                      <span className="scope__menu-name">{d.fileName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </li>
        )}
      </ul>
    </div>
  );
}

function shorten(name: string, max = 28) {
  if (name.length <= max) return name;
  const ext = name.lastIndexOf('.');
  if (ext > 0 && name.length - ext < 6) {
    return name.slice(0, max - (name.length - ext) - 1) + '…' + name.slice(ext);
  }
  return name.slice(0, max - 1) + '…';
}
