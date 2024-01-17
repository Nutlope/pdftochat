import Header from '@/components/home/Header';
import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="mt-5">
      <Header />
      <div className="flex mx-auto justify-center items-center mt-10">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                'bg-black hover:bg-gray-700 transition text-sm normal-case',
            },
          }}
          afterSignInUrl="/dashboard"
        />
      </div>
    </div>
  );
}
