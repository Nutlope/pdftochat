import Link from 'next/link';
import { Github } from 'lucide-react';

export default function ProudlyOpenSource() {
  return (
    <section className="shell band">
      <div className="band__copy">
        <p className="eyebrow">Open source</p>
        <h2 className="band__title">Read it. Fork it. Run it yourself.</h2>
        <p className="band__lede">
          Every line is on GitHub — including the ingest pipeline, the chat
          route, and the prompt. MIT licensed.
        </p>
      </div>
      <Link
        href="https://github.com/Nutlope/pdftochat"
        className="btn btn--secondary"
        aria-label="Source on GitHub"
      >
        <Github size={14} aria-hidden="true" />
        Star on GitHub
      </Link>
    </section>
  );
}
