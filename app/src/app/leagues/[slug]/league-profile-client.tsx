"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Users,
  Trophy,
  MapPin,
  Calendar,
  ArrowLeft,
  UserPlus,
  Settings,
  Crown,
  Shield,
  Medal,
  Loader2,
  ExternalLink,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import type { LeagueType, LeagueTier } from "@/types";

interface LeagueMember {
  id: string;
  role: string;
  joinedAt: string;
  athlete: {
    id: string;
    displayName: string;
    slug: string;
    profilePicture?: string;
    chronologicalAge: number;
    division: string;
    generation: string;
    verified: boolean;
  };
  latestSubmission?: {
    ageReduction: number;
    phenoAge: number;
    submittedAt: string;
  } | null;
}

interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  avgAgeReduction: number;
  activeMembers: number;
  bestIndividual: number;
}

interface LeagueOwner {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface LeagueProfileData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: LeagueType;
  tier: LeagueTier;
  logo?: string;
  city?: string;
  country?: string;
  verified: boolean;
  createdAt: string;
  memberCount: number;
  submissionCount: number;
  members: LeagueMember[];
  leaderboardEntry?: LeaderboardEntry | null;
  owner?: LeagueOwner | null;
}

const typeIcons: Record<LeagueType, string> = {
  CLINIC: "🏥",
  CORPORATE: "🏢",
  COLLECTIVE: "👥",
  GEOGRAPHIC: "🌍",
  CUSTOM: "⭐",
};

const tierColors: Record<LeagueTier, string> = {
  FREE: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  STARTER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PRO: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  ENTERPRISE: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const roleIcons: Record<string, React.ReactNode> = {
  ADMIN: <Crown className="h-4 w-4 text-yellow-400" />,
  CAPTAIN: <Shield className="h-4 w-4 text-blue-400" />,
  MEMBER: null,
};

interface LeagueProfileClientProps {
  league: LeagueProfileData;
}

export function LeagueProfileClient({ league }: LeagueProfileClientProps) {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const toast = useToast();

  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [members, _setMembers] = useState(league.members);
  const [memberCount, setMemberCount] = useState(league.memberCount);

  useEffect(() => {
    // Check if current user is a member
    if (isSignedIn && league.members) {
      const membership = league.members.find(
        (m) => m.athlete?.id === userId
      );
      if (membership) {
        setIsMember(true);
        setUserRole(membership.role);
      }
    }
  }, [isSignedIn, userId, league.members]);

  async function handleJoin() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setJoining(true);
    try {
      const response = await fetch(`/api/leagues/${league.slug}/members`, {
        method: "POST",
      });

      if (response.ok) {
        setIsMember(true);
        setUserRole("MEMBER");
        setMemberCount((prev) => prev + 1);
        toast.success("Joined!", `You're now a member of ${league.name}`);
        // Refresh the page to get updated data
        router.refresh();
      } else {
        const error = await response.json();
        toast.error("Failed to join", error.error || "Please try again");
      }
    } catch (error) {
      console.error("Failed to join league:", error);
      toast.error("Failed to join league", "Please try again later");
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    if (!confirm("Are you sure you want to leave this league?")) return;

    try {
      const response = await fetch(`/api/leagues/${league.slug}/members`, {
        method: "DELETE",
      });

      if (response.ok) {
        setIsMember(false);
        setUserRole(null);
        setMemberCount((prev) => prev - 1);
        toast.info("Left league", `You're no longer a member of ${league.name}`);
        router.refresh();
      } else {
        const error = await response.json();
        toast.error("Failed to leave", error.error || "Please try again");
      }
    } catch (error) {
      console.error("Failed to leave league:", error);
      toast.error("Something went wrong", "Failed to leave league");
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: league.name,
        text: `Check out ${league.name} on Longevity World Cup`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!", "Share the link with your friends");
    }
  }

  const isAdmin = userRole === "ADMIN" || league.owner?.id === userId;
  const canManage = isAdmin || userRole === "CAPTAIN";

  return (
    <div className="min-h-screen bg-gradient-radial py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/leagues")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Leagues
        </Button>

        {/* Header */}
        <Card variant="elevated" className="mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-[var(--background-elevated)] flex items-center justify-center text-5xl shrink-0 mx-auto md:mx-0">
                {league.logo ? (
                  <img
                    src={league.logo}
                    alt={league.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  typeIcons[league.type]
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-[var(--foreground)]">
                    {league.name}
                  </h1>
                  {league.verified ? <Badge variant="secondary">Verified</Badge> : null}
                </div>

                {(league.city || league.country) ? <div className="flex items-center justify-center md:justify-start gap-1 text-[var(--foreground-secondary)] mb-3">
                    <MapPin className="h-4 w-4" />
                    {league.city && league.country
                      ? `${league.city}, ${league.country}`
                      : league.country}
                  </div> : null}

                {league.description ? <p className="text-[var(--foreground-secondary)] mb-4 max-w-2xl">
                    {league.description}
                  </p> : null}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                  <Badge variant="outline" className={tierColors[league.tier]}>
                    {league.tier}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {league.type.toLowerCase()}
                  </Badge>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[var(--foreground-muted)]" />
                    <span className="text-[var(--foreground)]">
                      {memberCount} members
                    </span>
                  </div>
                  {league.leaderboardEntry ? <>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        <span className="text-[var(--foreground)]">
                          Rank #{league.leaderboardEntry.rank}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Medal className="h-4 w-4 text-[var(--color-success)]" />
                        <span className="text-[var(--color-success)] font-semibold">
                          -{league.leaderboardEntry.avgAgeReduction.toFixed(1)} yrs avg
                        </span>
                      </div>
                    </> : null}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--foreground-muted)]" />
                    <span className="text-[var(--foreground-muted)]">
                      Created {new Date(league.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                {isMember ? (
                  <>
                    {canManage ? <Button
                        variant="outline"
                        onClick={() => router.push(`/leagues/${league.slug}/manage`)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Manage
                      </Button> : null}
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-[var(--color-error)]"
                      onClick={handleLeave}
                    >
                      Leave League
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleJoin} disabled={joining}>
                      {joining ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      Join League
                    </Button>
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Members List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members ({memberCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--background-elevated)] cursor-pointer transition-colors"
                        onClick={() => router.push(`/athletes/${member.athlete.slug}`)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.athlete.profilePicture} />
                          <AvatarFallback>
                            {member.athlete.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--foreground)] truncate">
                              {member.athlete.displayName}
                            </span>
                            {roleIcons[member.role]}
                            {member.athlete.verified ? <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge> : null}
                          </div>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {member.latestSubmission ? <div className="text-right">
                            <p className="font-semibold text-[var(--color-success)]">
                              -{member.latestSubmission.ageReduction.toFixed(1)} yrs
                            </p>
                            <p className="text-xs text-[var(--foreground-muted)]">
                              Age reduction
                            </p>
                          </div> : null}
                        <ExternalLink className="h-4 w-4 text-[var(--foreground-muted)]" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-[var(--foreground-muted)] mb-2" />
                    <p className="text-[var(--foreground-secondary)]">
                      No members yet
                    </p>
                    {!isMember && (
                      <Button className="mt-4" onClick={handleJoin}>
                        Be the first to join
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard Position */}
            {league.leaderboardEntry ? <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    League Standing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-5xl font-bold text-[var(--foreground)] mb-1">
                      #{league.leaderboardEntry.rank}
                    </p>
                    <p className="text-sm text-[var(--foreground-muted)] mb-4">
                      Global Rank
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-[var(--color-success)]">
                          -{league.leaderboardEntry.avgAgeReduction.toFixed(1)}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Avg Years
                        </p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[var(--foreground)]">
                          {league.leaderboardEntry.activeMembers}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Active
                        </p>
                      </div>
                    </div>
                    {league.leaderboardEntry.bestIndividual > 0 && (
                      <div className="mt-4 pt-4 border-t border-[var(--border)]">
                        <p className="text-sm text-[var(--foreground-muted)]">
                          Best Individual
                        </p>
                        <p className="text-xl font-bold text-[var(--color-success)]">
                          -{league.leaderboardEntry.bestIndividual.toFixed(1)} yrs
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card> : null}

            {/* Owner Info */}
            {league.owner ? <Card>
                <CardHeader>
                  <CardTitle>League Owner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {league.owner.firstName?.charAt(0) ||
                          league.owner.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {league.owner.firstName} {league.owner.lastName}
                      </p>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        Owner
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card> : null}

            {/* Quick Actions for Members */}
            {isMember ? <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => router.push("/submit")}
                  >
                    Submit Biomarkers
                  </Button>
                  {canManage ? <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/leagues/${league.slug}/invite`)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Members
                    </Button> : null}
                </CardContent>
              </Card> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
