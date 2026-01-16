import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

// Conditionally import Clerk auth to handle missing config
async function getAuth() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return { userId: null };
  }
  const { auth } = await import("@clerk/nextjs/server");
  return auth();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await getAuth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has completed onboarding (has User + Athlete records)
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { athlete: true },
  });

  // User doesn't exist or has no athlete profile - redirect to onboarding
  if (!user || !user.athlete) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
