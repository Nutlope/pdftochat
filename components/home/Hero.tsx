import Link from 'next/link';

export default function Hero() {
  return (
    <section className="shell hero">
      <div className="hero__copy">
        <a
          href="https://togetherai.link"
          target="_blank"
          rel="noreferrer"
          className="hero__credit"
        >
          <span className="hero__credit-dot" aria-hidden="true" />
          Powered by Together AI &nbsp;·&nbsp; Mixtral
        </a>

        <h1 className="hero__title">
          Chat with your PDFs<span className="hero__period">.</span>
        </h1>

        <p className="hero__lede">
          Upload a paper, contract, or textbook. PDFtoChat reads it page by
          page, then answers in your words — with the exact source pages
          alongside every reply.
        </p>

        <div className="hero__actions">
          <Link href="/sign-up" className="btn btn--primary">
            Get started
          </Link>
          <Link href="#how-it-works" className="btn btn--secondary">
            See how it works
          </Link>
        </div>
      </div>

      <figure className="hero__preview" aria-hidden="true">
        <PreviewMock />
      </figure>
    </section>
  );
}

function PreviewMock() {
  return (
    <div className="mock">
      <div className="mock__chrome">
        <span />
        <span />
        <span />
        <p className="mock__url">pdftochat.com / document</p>
      </div>
      <div className="mock__body">
        <div className="mock__pdf" aria-label="PDF preview">
          <div className="mock__pdf-tab">stevens-2024.pdf</div>
          <div className="mock__pdf-page">
            <div className="mock__pdf-h" />
            <div className="mock__pdf-line" />
            <div className="mock__pdf-line" />
            <div className="mock__pdf-line short" />
            <div className="mock__pdf-line" />
            <div className="mock__pdf-line" />
            <div className="mock__pdf-line short" />
            <div className="mock__pdf-block" />
            <div className="mock__pdf-line" />
            <div className="mock__pdf-line" />
            <div className="mock__pdf-line short" />
          </div>
        </div>
        <div className="mock__chat">
          <div className="mock__msg mock__msg--user">
            <p>What does the author conclude in section 3?</p>
          </div>
          <div className="mock__msg mock__msg--bot">
            <p>
              The author argues that prior estimates underweight long-tail
              latency. They propose a re-weighted error metric — defined on
              p.&nbsp;7 — that recovers the gap.
            </p>
            <div className="mock__sources">
              <span>p. 7</span>
              <span>p. 12</span>
            </div>
          </div>
          <div className="mock__composer">
            <span>Ask me anything…</span>
            <span className="mock__send" aria-hidden="true">
              ↑
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
