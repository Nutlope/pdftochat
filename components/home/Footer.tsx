import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';
import Logo from '../ui/Logo';

export default function Footer() {
  return (
    <footer className="foot">
      <div className="shell foot__inner">
        <Logo />
        <p className="foot__credit">
          Built with{' '}
          <a href="https://togetherai.link" target="_blank" rel="noreferrer">
            Together AI
          </a>
          ,{' '}
          <a href="https://mistral.ai/" target="_blank" rel="noreferrer">
            Mixtral
          </a>
          ,{' '}
          <a href="https://www.mongodb.com/" target="_blank" rel="noreferrer">
            MongoDB
          </a>{' '}
          &amp;{' '}
          <a href="https://www.langchain.com/" target="_blank" rel="noreferrer">
            Langchain
          </a>
          .
        </p>
        <div className="foot__social">
          <Link
            href="https://twitter.com/nutlope"
            aria-label="Twitter"
            target="_blank"
          >
            <Twitter size={16} aria-hidden="true" />
          </Link>
          <Link
            href="https://github.com/nutlope/pdftochat"
            aria-label="GitHub"
            target="_blank"
          >
            <Github size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
