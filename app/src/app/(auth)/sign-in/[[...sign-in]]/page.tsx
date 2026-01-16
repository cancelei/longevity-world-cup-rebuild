import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">
            Welcome Back
          </h1>
          <p className="text-[var(--foreground-secondary)]">
            Sign in to track your biological age and compete
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl",
            },
          }}
        />
      </div>
    </div>
  );
}
