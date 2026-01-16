"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LeagueType } from "@/types";

const leagueTypes: {
  value: LeagueType;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "CLINIC",
    label: "Longevity Clinic",
    icon: "🏥",
    description: "Medical clinics, health centers, and longevity practices",
  },
  {
    value: "CORPORATE",
    label: "Corporate Wellness",
    icon: "🏢",
    description: "Company wellness programs and employee health initiatives",
  },
  {
    value: "COLLECTIVE",
    label: "Biohacker Collective",
    icon: "👥",
    description: "Communities, groups, and biohacking collectives",
  },
  {
    value: "GEOGRAPHIC",
    label: "Geographic",
    icon: "🌍",
    description: "City, region, or country-based leagues",
  },
  {
    value: "CUSTOM",
    label: "Custom League",
    icon: "⭐",
    description: "Any other type of organization or group",
  },
];

interface FormData {
  type: LeagueType | "";
  name: string;
  description: string;
  country: string;
  city: string;
}

export default function CreateLeaguePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    type: "",
    name: "",
    description: "",
    country: "",
    city: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to sign in if not authenticated
  if (isLoaded && !isSignedIn) {
    router.push("/sign-in?redirect=/leagues/new");
    return null;
  }

  const handleTypeSelect = (type: LeagueType) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const canProceedStep1 = formData.type !== "";
  const canProceedStep2 = formData.name.trim().length >= 3;

  const handleNext = () => {
    if (step === 1 && canProceedStep1) {
      setStep(2);
    } else if (step === 2 && canProceedStep2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceedStep2) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          type: formData.type,
          country: formData.country.trim() || undefined,
          city: formData.city.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create league");
      }

      // Success - redirect to the new league
      router.push(`/leagues/${data.slug}?created=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create league");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/leagues")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Leagues
        </Button>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? "w-8 bg-[var(--color-primary)]"
                  : s < step
                  ? "w-2 bg-[var(--color-primary)]"
                  : "w-2 bg-[var(--border)]"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card variant="elevated">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Create a League</CardTitle>
                  <CardDescription>
                    What type of league are you creating?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {leagueTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleTypeSelect(type.value)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          formData.type === type.value
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                            : "border-[var(--border)] hover:border-[var(--foreground-muted)]"
                        }`}
                      >
                        <span className="text-3xl">{type.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-[var(--foreground)]">
                            {type.label}
                          </p>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {type.description}
                          </p>
                        </div>
                        {formData.type === type.value && (
                          <Check className="h-5 w-5 text-[var(--color-primary)]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={handleNext}
                      disabled={!canProceedStep1}
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Basic Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card variant="elevated">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">
                    {leagueTypes.find((t) => t.value === formData.type)?.icon}
                  </div>
                  <CardTitle className="text-2xl">League Details</CardTitle>
                  <CardDescription>
                    Tell us about your{" "}
                    {leagueTypes
                      .find((t) => t.value === formData.type)
                      ?.label.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">League Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Blueprint Longevity Clinic"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                      <p className="text-xs text-[var(--foreground-muted)] mt-1">
                        Minimum 3 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Tell potential members about your league..."
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          placeholder="e.g., United States"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="e.g., San Francisco"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!canProceedStep2}
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Review & Create */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card variant="elevated">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Review & Create</CardTitle>
                  <CardDescription>
                    Make sure everything looks good
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Preview */}
                  <div className="bg-[var(--background-elevated)] rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[var(--background-card)] flex items-center justify-center text-3xl">
                        {leagueTypes.find((t) => t.value === formData.type)?.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[var(--foreground)]">
                          {formData.name}
                        </h3>
                        <p className="text-sm text-[var(--foreground-muted)] capitalize">
                          {formData.type.toLowerCase()} league
                        </p>
                        {(formData.city || formData.country) ? <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                            {[formData.city, formData.country]
                              .filter(Boolean)
                              .join(", ")}
                          </p> : null}
                        {formData.description ? <p className="text-sm text-[var(--foreground-secondary)] mt-2">
                            {formData.description}
                          </p> : null}
                      </div>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="flex gap-3 p-4 rounded-lg bg-[var(--color-info)]/10 border border-[var(--color-info)]/20 mb-6">
                    <Info className="h-5 w-5 text-[var(--color-info)] shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-[var(--foreground)]">
                        Free Tier League
                      </p>
                      <p className="text-[var(--foreground-secondary)]">
                        Your league will start on the Free tier (up to 10 members).
                        Free leagues require admin approval before becoming active.
                        Upgrade anytime to add more members and features.
                      </p>
                    </div>
                  </div>

                  {error ? <div className="p-4 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 mb-6">
                      <p className="text-sm text-[var(--color-error)]">{error}</p>
                    </div> : null}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Building2 className="mr-2 h-4 w-4" />
                      )}
                      Create League
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
