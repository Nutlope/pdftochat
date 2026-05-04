const STEPS = [
  {
    num: '01',
    title: 'Sign up',
    body: 'Create a free PDFtoChat account. Takes a few seconds.',
  },
  {
    num: '02',
    title: 'Upload a PDF',
    body: 'Drag in a paper, contract, or textbook. We index it page by page.',
  },
  {
    num: '03',
    title: 'Ask anything',
    body: 'Talk to the document. Every reply cites the source pages it came from.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="shell"
      style={{ paddingBlock: 'var(--space-2xl)' }}
    >
      <header
        style={{
          display: 'grid',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-2xl)',
        }}
      >
        <p className="eyebrow">How it works</p>
        <h2
          style={{ fontSize: 'var(--text-3xl)', maxWidth: '24ch', margin: 0 }}
        >
          From PDF to conversation in three steps.
        </h2>
      </header>
      <ol className="steps">
        {STEPS.map((s) => (
          <li key={s.num} className="step">
            <span className="step__num">{s.num}</span>
            <h3 className="step__title">{s.title}</h3>
            <p className="step__body">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
