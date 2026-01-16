"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Camera,
  Globe,
  Twitter,
  Instagram,
  Mail,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AthleteProfile {
  id: string;
  displayName: string;
  slug: string;
  bio: string | null;
  profilePicture: string | null;
  birthYear: number;
  division: string;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  mediaContact: string | null;
}

interface ProfileEditClientProps {
  athlete: AthleteProfile;
}

export function ProfileEditClient({ athlete }: ProfileEditClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profilePicture, setProfilePicture] = useState(athlete.profilePicture);

  const [formData, setFormData] = useState({
    displayName: athlete.displayName,
    bio: athlete.bio || "",
    website: athlete.website || "",
    twitter: athlete.twitter || "",
    instagram: athlete.instagram || "",
    mediaContact: athlete.mediaContact || "",
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5MB.");
      return;
    }

    setIsUploadingPhoto(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/athletes/me/photo", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      setProfilePicture(data.profilePicture);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!profilePicture) return;

    setIsDeletingPhoto(true);
    setError(null);

    try {
      const response = await fetch("/api/athletes/me/photo", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove photo");
      }

      setProfilePicture(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove photo");
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/athletes/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/athletes/${athlete.slug}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href={`/athletes/${athlete.slug}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center gap-4 pb-6 border-b border-[var(--border)]">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profilePicture || undefined} />
                      <AvatarFallback className="text-2xl">
                        {formData.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isUploadingPhoto ? <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div> : null}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto || isDeletingPhoto}
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 mr-2" />
                      )}
                      {profilePicture ? "Change Photo" : "Upload Photo"}
                    </Button>

                    {profilePicture ? <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemovePhoto}
                        disabled={isUploadingPhoto || isDeletingPhoto}
                        className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                      >
                        {isDeletingPhoto ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button> : null}
                  </div>

                  <p className="text-xs text-[var(--foreground-muted)]">
                    JPEG, PNG, WebP or GIF. Max 5MB.
                  </p>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself and your longevity journey..."
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                    />
                    <p className="text-xs text-[var(--foreground-muted)]">
                      Max 500 characters
                    </p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                  <h3 className="text-sm font-medium text-[var(--foreground-secondary)]">
                    Social Links
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[var(--foreground-muted)]" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-[var(--foreground-muted)]" />
                      Twitter / X
                    </Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleChange}
                      placeholder="@username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-[var(--foreground-muted)]" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="@username"
                    />
                  </div>
                </div>

                {/* Media Contact */}
                <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                  <h3 className="text-sm font-medium text-[var(--foreground-secondary)]">
                    Media Inquiries
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="mediaContact" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[var(--foreground-muted)]" />
                      Media Contact Email
                    </Label>
                    <Input
                      id="mediaContact"
                      name="mediaContact"
                      type="email"
                      value={formData.mediaContact}
                      onChange={handleChange}
                      placeholder="media@example.com"
                    />
                    <p className="text-xs text-[var(--foreground-muted)]">
                      Optional: Public email for press and media inquiries
                    </p>
                  </div>
                </div>

                {/* Read-only Info */}
                <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                  <h3 className="text-sm font-medium text-[var(--foreground-secondary)]">
                    Account Info (Read Only)
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2 text-[var(--foreground-muted)]">
                        <Calendar className="w-4 h-4" />
                        Birth Year
                      </Label>
                      <p className="text-[var(--foreground)]">{athlete.birthYear}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[var(--foreground-muted)]">Division</Label>
                      <p className="text-[var(--foreground)] capitalize">
                        {athlete.division.toLowerCase()}
                      </p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[var(--foreground-muted)]">Profile URL</Label>
                      <p className="text-sm text-[var(--foreground)]">
                        /athletes/{athlete.slug}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                {error ? <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-error)]/10 text-[var(--color-error)]"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </motion.div> : null}

                {success ? <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <p className="text-sm">Profile updated successfully! Redirecting...</p>
                  </motion.div> : null}

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4">
                  <Link href={`/athletes/${athlete.slug}`}>
                    <Button type="button" variant="ghost">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" isLoading={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
