import Header from '@/components/home/Header';
import { SignIn } from '@clerk/nextjs';

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
            <p className="eyebrow">Welcome back</p>
            <h1>Sign in to PDFtoChat.</h1>
          </div>
          <SignIn
            appearance={clerkAppearance as any}
            afterSignInUrl="/dashboard"
          />
        </div>
      </section>
    </div>
  );
}
