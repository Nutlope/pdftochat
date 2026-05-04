import Header from '@/components/home/Header';
import { SignUp } from '@clerk/nextjs';

const clerkAppearance = {
  variables: {
    colorPrimary: '#1a1a1a',
    colorText: '#1a1a1a',
    colorBackground: '#fbfbfa',
    fontFamily: 'var(--font-body)',
    borderRadius: '10px',
  },
  elements: {
    rootBox: 'mx-auto',
    card: 'shadow-none border border-rule rounded-lg bg-paper',
    headerTitle: 'text-ink font-display',
    headerSubtitle: 'text-ink-2',
    formButtonPrimary:
      'bg-ink hover:bg-ink-2 text-paper rounded-pill normal-case font-medium',
    formFieldInput: 'border-rule-2 rounded-md',
    socialButtonsBlockButton: 'border-rule rounded-md',
    footerActionLink: 'text-ink underline-offset-4',
  },
} as const;

export default function Page() {
  return (
    <div className="page">
      <Header />
      <section className="auth">
        <div className="auth__inner">
          <div style={{ display: 'grid', gap: 'var(--space-2xs)' }}>
            <p className="eyebrow">Get started</p>
            <h1>Create your PDFtoChat account.</h1>
            <p>Free, open source, no credit card.</p>
          </div>
          <SignUp
            appearance={clerkAppearance as any}
            afterSignUpUrl="/dashboard"
          />
        </div>
      </section>
    </div>
  );
}
