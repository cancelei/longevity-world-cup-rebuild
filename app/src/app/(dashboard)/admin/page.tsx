import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminDashboardClient } from "./admin-dashboard-client";

async function getAdminData() {
  const pendingSubmissions = await prisma.biomarkerSubmission.findMany({
    where: { status: "PENDING" },
    include: {
      athlete: {
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      season: {
        select: {
          name: true,
          year: true,
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  const pendingAthletes = await prisma.athlete.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const recentActivity = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      athlete: {
        select: {
          displayName: true,
          slug: true,
        },
      },
    },
  });

  const stats = {
    totalAthletes: await prisma.athlete.count(),
    verifiedAthletes: await prisma.athlete.count({ where: { status: "VERIFIED" } }),
    pendingAthletes: pendingAthletes.length,
    totalSubmissions: await prisma.biomarkerSubmission.count(),
    pendingSubmissions: pendingSubmissions.length,
    approvedSubmissions: await prisma.biomarkerSubmission.count({
      where: { status: "APPROVED" },
    }),
  };

  return {
    pendingSubmissions: pendingSubmissions.map((s) => ({
      id: s.id,
      athleteId: s.athleteId,
      athleteName: s.athlete.displayName,
      athleteEmail: s.athlete.user.email,
      seasonName: `${s.season.name} ${s.season.year}`,
      submittedAt: s.submittedAt.toISOString(),
      phenoAge: s.phenoAge,
      ageReduction: s.ageReduction,
      biomarkers: {
        albumin: s.albumin,
        creatinine: s.creatinine,
        glucose: s.glucose,
        crp: s.crp,
        lymphocytePercent: s.lymphocytePercent,
        mcv: s.mcv,
        rdw: s.rdw,
        alp: s.alp,
        wbc: s.wbc,
      },
      proofImages: (s.proofImages as string[]) || [],
    })),
    pendingAthletes: pendingAthletes.map((a) => ({
      id: a.id,
      displayName: a.displayName,
      slug: a.slug,
      email: a.user.email,
      profilePicture: a.profilePicture || a.user.imageUrl,
      birthYear: a.birthYear,
      division: a.division,
      createdAt: a.createdAt.toISOString(),
    })),
    recentActivity: recentActivity.map((e) => ({
      id: e.id,
      type: e.type,
      message: e.message,
      athleteName: e.athlete?.displayName,
      athleteSlug: e.athlete?.slug,
      createdAt: e.createdAt.toISOString(),
    })),
    stats,
  };
}

export default async function AdminDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const data = await getAdminData();

  return <AdminDashboardClient {...data} />;
}
