import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">
            Join the Competition
          </h1>
          <p className="text-[var(--foreground-secondary)]">
            Create an account to start tracking your longevity journey
          </p>
        </div>
        <SignUp
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
