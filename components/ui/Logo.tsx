import Link from 'next/link';
import Mark from './Mark';

export default function Logo() {
  return (
    <Link href="/" className="wordmark" aria-label="PDFtoChat home">
      <Mark size={20} className="wordmark__mark" />
      <span>
        pdf<span className="glyph">→</span>chat
      </span>
    </Link>
  );
}
