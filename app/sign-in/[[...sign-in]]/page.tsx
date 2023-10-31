import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex mx-auto justify-center items-center mt-10">
      <SignIn afterSignInUrl="/dashboard" />
    </div>
  );
}
