"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Calendar, Users, Check, ArrowRight, ArrowLeft, Building2, Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Division = "mens" | "womens" | "open";

interface League {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  memberCount: number;
}

interface OnboardingData {
  displayName: string;
  birthYear: number;
  division: Division;
  leagueId: string | null;
}

interface FormErrors {
  displayName?: string;
  birthYear?: string;
  division?: string;
  leagueId?: string;
}

const steps = [
  { id: 1, title: "Your Name", icon: User },
  { id: 2, title: "Birth Year", icon: Calendar },
  { id: 3, title: "Division", icon: Users },
  { id: 4, title: "Join League", icon: Building2 },
  { id: 5, title: "Confirm", icon: Check },
];

const divisions: { value: Division; label: string; description: string }[] = [
  { value: "mens", label: "Men's Division", description: "Compete with male athletes" },
  { value: "womens", label: "Women's Division", description: "Compete with female athletes" },
  { value: "open", label: "Open Division", description: "Compete with all athletes regardless of gender" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    birthYear: new Date().getFullYear() - 30,
    division: "open",
    leagueId: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // League state
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [leagueSearch, setLeagueSearch] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);

  const currentYear = new Date().getFullYear();
  const calculatedAge = currentYear - data.birthYear;

  // Fetch leagues when reaching step 4
  useEffect(() => {
    if (currentStep === 4) {
      fetchLeagues();
    }
  }, [currentStep]);

  async function fetchLeagues(search?: string) {
    setLoadingLeagues(true);
    try {
      const params = new URLSearchParams();
      params.set("status", "ACTIVE");
      params.set("limit", "20");
      if (search) params.set("search", search);

      const response = await fetch(`/api/leagues?${params}`);
      const result = await response.json();
      setLeagues(result.data || []);
    } catch (error) {
      console.error("Failed to fetch leagues:", error);
    } finally {
      setLoadingLeagues(false);
    }
  }

  function handleLeagueSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchLeagues(leagueSearch);
  }

  function selectLeague(league: League) {
    setSelectedLeague(league);
    setData({ ...data, leagueId: league.id });
  }

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1 && !data.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (step === 2) {
      if (data.birthYear < 1900 || data.birthYear > currentYear - 18) {
        newErrors.birthYear = "You must be at least 18 years old";
      }
    }

    if (step === 4 && !data.leagueId) {
      newErrors.leagueId = "Please select a league to join";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Profile created!", "Welcome to Longevity World Cup");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        toast.error("Failed to create profile", error.message || "Please try again");
      }
    } catch (_error) {
      toast.error("Something went wrong", "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                  currentStep >= step.id
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--background)]"
                    : "border-[var(--border)] text-[var(--foreground-muted)]"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-2 transition-all",
                    currentStep > step.id
                      ? "bg-[var(--color-primary)]"
                      : "bg-[var(--border)]"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card variant="elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display">
              {currentStep === 1 && "What should we call you?"}
              {currentStep === 2 && "When were you born?"}
              {currentStep === 3 && "Choose your division"}
              {currentStep === 4 && "Join a league"}
              {currentStep === 5 && "Confirm your profile"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "This will be displayed on the leaderboard"}
              {currentStep === 2 && "This determines your chronological age"}
              {currentStep === 3 && "You can compete in one division per season"}
              {currentStep === 4 && "Leagues compete together for age reversal glory"}
              {currentStep === 5 && "Review your information before continuing"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Display Name */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Input
                    label="Display Name"
                    placeholder="Enter your display name"
                    value={data.displayName}
                    onChange={(e) => setData({ ...data, displayName: e.target.value })}
                    error={errors.displayName as string}
                    autoFocus
                  />
                  <p className="text-sm text-[var(--foreground-muted)]">
                    This can be your real name or a pseudonym. It will be publicly visible.
                  </p>
                </motion.div>
              )}

              {/* Step 2: Birth Year */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Input
                    label="Birth Year"
                    type="number"
                    min={1900}
                    max={currentYear - 18}
                    value={data.birthYear}
                    onChange={(e) => setData({ ...data, birthYear: parseInt(e.target.value) || 0 })}
                    error={errors.birthYear as string}
                  />
                  <div className="p-4 rounded-xl bg-[var(--background-card)] border border-[var(--border)]">
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Calculated Age:{" "}
                      <span className="text-xl font-bold text-[var(--color-primary)]">
                        {calculatedAge} years old
                      </span>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Division */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {divisions.map((division) => (
                    <button
                      key={division.value}
                      onClick={() => setData({ ...data, division: division.value })}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all",
                        data.division === division.value
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                          : "border-[var(--border)] hover:border-[var(--border-light)]"
                      )}
                    >
                      <p className="font-semibold text-[var(--foreground)]">{division.label}</p>
                      <p className="text-sm text-[var(--foreground-secondary)]">{division.description}</p>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Step 4: League Selection */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Search */}
                  <form onSubmit={handleLeagueSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
                      <Input
                        placeholder="Search leagues..."
                        value={leagueSearch}
                        onChange={(e) => setLeagueSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button type="submit" variant="secondary" size="sm">
                      Search
                    </Button>
                  </form>

                  {/* League List */}
                  {loadingLeagues ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
                    </div>
                  ) : leagues.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {leagues.map((league) => (
                        <button
                          key={league.id}
                          onClick={() => selectLeague(league)}
                          className={cn(
                            "w-full p-4 rounded-xl border text-left transition-all",
                            selectedLeague?.id === league.id
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                              : "border-[var(--border)] hover:border-[var(--border-light)]"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-[var(--foreground)]">{league.name}</p>
                              <p className="text-sm text-[var(--foreground-muted)] capitalize">
                                {league.type.toLowerCase()} · {league.memberCount} members
                              </p>
                            </div>
                            {selectedLeague?.id === league.id && (
                              <Check className="w-5 h-5 text-[var(--color-primary)]" />
                            )}
                          </div>
                          {league.description ? <p className="text-sm text-[var(--foreground-secondary)] mt-1 line-clamp-1">
                              {league.description}
                            </p> : null}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-2" />
                      <p className="text-[var(--foreground-secondary)]">No leagues found</p>
                    </div>
                  )}

                  {/* Create League Option */}
                  <div className="pt-4 border-t border-[var(--border)]">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/leagues/new?returnTo=onboarding")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create a New League
                    </Button>
                  </div>

                  {/* Error message */}
                  {errors.leagueId ? <p className="text-sm text-[var(--color-error)]">{errors.leagueId}</p> : null}
                </motion.div>
              )}

              {/* Step 5: Confirm */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between p-4 rounded-xl bg-[var(--background-card)]">
                      <span className="text-[var(--foreground-secondary)]">Display Name</span>
                      <span className="font-semibold text-[var(--foreground)]">{data.displayName}</span>
                    </div>
                    <div className="flex justify-between p-4 rounded-xl bg-[var(--background-card)]">
                      <span className="text-[var(--foreground-secondary)]">Birth Year</span>
                      <span className="font-semibold text-[var(--foreground)]">{data.birthYear}</span>
                    </div>
                    <div className="flex justify-between p-4 rounded-xl bg-[var(--background-card)]">
                      <span className="text-[var(--foreground-secondary)]">Age</span>
                      <span className="font-semibold text-[var(--foreground)]">{calculatedAge} years</span>
                    </div>
                    <div className="flex justify-between p-4 rounded-xl bg-[var(--background-card)]">
                      <span className="text-[var(--foreground-secondary)]">Division</span>
                      <span className="font-semibold text-[var(--foreground)] capitalize">
                        {data.division === "mens" ? "Men's" : data.division === "womens" ? "Women's" : "Open"}
                      </span>
                    </div>
                    <div className="flex justify-between p-4 rounded-xl bg-[var(--background-card)]">
                      <span className="text-[var(--foreground-secondary)]">League</span>
                      <span className="font-semibold text-[var(--foreground)]">
                        {selectedLeague?.name || "None selected"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button variant="ghost" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <Button onClick={nextStep}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} isLoading={isSubmitting}>
                  Create Profile
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
