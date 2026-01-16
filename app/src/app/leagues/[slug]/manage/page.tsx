"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  Settings,
  Users,
  UserPlus,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import type { League, LeagueMemberRole } from "@/types";

interface LeagueMember {
  id: string;
  role: LeagueMemberRole;
  joinedAt: string;
  athlete: {
    id: string;
    displayName: string;
    slug: string;
    profilePicture?: string;
  };
}

interface LeagueDetail extends League {
  members: LeagueMember[];
  memberCount: number;
}

const roleOptions: { value: LeagueMemberRole; label: string }[] = [
  { value: "MEMBER", label: "Member" },
  { value: "CAPTAIN", label: "Captain" },
  { value: "ADMIN", label: "Admin" },
];

export default function ManageLeaguePage() {
  const router = useRouter();
  const params = useParams();
  const { isSignedIn, isLoaded } = useAuth();
  const toast = useToast();
  const slug = params.slug as string;

  const [league, setLeague] = useState<LeagueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    country: "",
    city: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    fetchLeague();
  }, [slug, isLoaded, isSignedIn]);

  async function fetchLeague() {
    setLoading(true);
    try {
      const response = await fetch(`/api/leagues/${slug}`);
      if (!response.ok) {
        router.push("/leagues");
        return;
      }
      const data: LeagueDetail = await response.json();
      setLeague(data);
      setFormData({
        name: data.name,
        description: data.description || "",
        country: data.country || "",
        city: data.city || "",
      });
    } catch (error) {
      console.error("Failed to fetch league:", error);
      router.push("/leagues");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/leagues/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          country: formData.country.trim() || null,
          city: formData.city.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update league");
      }

      setSuccess("League updated successfully!");
      fetchLeague();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(athleteId: string, newRole: LeagueMemberRole) {
    try {
      const response = await fetch(`/api/leagues/${slug}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error("Failed to update role", data.error || "Please try again");
        return;
      }

      toast.success("Role updated", "Member role has been changed");
      fetchLeague();
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Something went wrong", "Failed to update role");
    }
  }

  async function handleRemoveMember(athleteId: string, displayName: string) {
    if (!confirm(`Remove ${displayName} from the league?`)) return;

    try {
      const response = await fetch(
        `/api/leagues/${slug}/members?athleteId=${athleteId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        toast.error("Failed to remove member", data.error || "Please try again");
        return;
      }

      toast.success("Member removed", `${displayName} has been removed from the league`);
      fetchLeague();
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Something went wrong", "Failed to remove member");
    }
  }

  async function handleDeleteLeague() {
    if (
      !confirm(
        "Are you sure you want to delete this league? This action cannot be undone."
      )
    )
      {return;}

    try {
      const response = await fetch(`/api/leagues/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error("Failed to delete league", data.error || "Please try again");
        return;
      }

      toast.success("League deleted", "The league has been permanently deleted");
      router.push("/leagues");
    } catch (error) {
      console.error("Failed to delete league:", error);
      toast.error("Something went wrong", "Failed to delete league");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!league) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-radial py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push(`/leagues/${slug}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to League
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-[var(--color-primary)]" />
          <div>
            <h1 className="text-2xl font-display font-bold text-[var(--foreground)]">
              Manage League
            </h1>
            <p className="text-[var(--foreground-secondary)]">{league.name}</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* League Settings */}
          <Card>
            <CardHeader>
              <CardTitle>League Settings</CardTitle>
              <CardDescription>
                Update your league&apos;s basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">League Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
              {success ? <p className="text-sm text-[var(--color-success)]">{success}</p> : null}

              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Members Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members ({league.memberCount})
                  </CardTitle>
                  <CardDescription>
                    Manage member roles and permissions
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/leagues/${slug}/invite`)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {league.members.length > 0 ? (
                <div className="space-y-3">
                  {league.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-[var(--background-elevated)]"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.athlete.profilePicture} />
                        <AvatarFallback>
                          {member.athlete.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--foreground)] truncate">
                          {member.athlete.displayName}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(
                            member.athlete.id,
                            e.target.value as LeagueMemberRole
                          )
                        }
                        className="h-9 px-3 rounded-lg bg-[var(--background-card)] border border-[var(--border)] text-sm text-[var(--foreground)]"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[var(--color-error)] hover:text-[var(--color-error)]"
                        onClick={() =>
                          handleRemoveMember(
                            member.athlete.id,
                            member.athlete.displayName
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[var(--foreground-muted)] py-4">
                  No members yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tier Information */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--background-elevated)]">
                <div>
                  <Badge
                    className={
                      league.tier === "FREE"
                        ? "bg-gray-500/10 text-gray-400"
                        : league.tier === "STARTER"
                        ? "bg-blue-500/10 text-blue-400"
                        : league.tier === "PRO"
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }
                  >
                    {league.tier}
                  </Badge>
                  <p className="text-sm text-[var(--foreground-muted)] mt-2">
                    {league.tier === "FREE" && "Up to 10 members"}
                    {league.tier === "STARTER" && "Up to 50 members"}
                    {league.tier === "PRO" && "Up to 250 members"}
                    {league.tier === "ENTERPRISE" && "Unlimited members"}
                  </p>
                </div>
                <Button variant="secondary" disabled>
                  Upgrade (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-[var(--color-error)]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--color-error)]">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-error)]/5">
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    Delete League
                  </p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Permanently delete this league and all associated data
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white"
                  onClick={handleDeleteLeague}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
