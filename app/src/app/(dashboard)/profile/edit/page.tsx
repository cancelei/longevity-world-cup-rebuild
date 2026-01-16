import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProfileEditClient } from "./profile-edit-client";

async function getAthleteProfile(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      athlete: true,
    },
  });

  if (!user || !user.athlete) {
    return null;
  }

  return {
    id: user.athlete.id,
    displayName: user.athlete.displayName,
    slug: user.athlete.slug,
    bio: user.athlete.bio,
    profilePicture: user.athlete.profilePicture,
    birthYear: user.athlete.birthYear,
    division: user.athlete.division,
    website: user.athlete.website,
    twitter: user.athlete.twitter,
    instagram: user.athlete.instagram,
    mediaContact: user.athlete.mediaContact,
  };
}

export default async function ProfileEditPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const athlete = await getAthleteProfile(userId);

  if (!athlete) {
    redirect("/join");
  }

  return <ProfileEditClient athlete={athlete} />;
}
