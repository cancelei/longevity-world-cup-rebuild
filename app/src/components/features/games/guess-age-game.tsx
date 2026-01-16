"use client";

import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Target, RefreshCw, Share2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AthleteForGame {
  id: string;
  displayName: string;
  slug: string;
  profilePicture: string | null;
  chronologicalAge: number;
  phenoAge: number;
}

interface GuessAgeGameProps {
  athlete: AthleteForGame;
  onComplete?: (guess: number, accuracy: number) => void;
  onNextAthlete?: () => void;
}

export const GuessAgeGame = memo(function GuessAgeGame({ athlete, onComplete, onNextAthlete }: GuessAgeGameProps) {
  const [guess, setGuess] = useState(35);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleSubmitGuess = async () => {
    setIsRevealing(true);

    // Simulate reveal animation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setHasGuessed(true);
    setIsRevealing(false);

    // Calculate accuracy (how close to chronological age)
    const difference = Math.abs(guess - athlete.chronologicalAge);
    const accuracy = Math.max(0, 100 - difference * 5);

    // Save guess to API
    try {
      await fetch("/api/games/guess-age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId: athlete.id,
          guessedAge: guess,
        }),
      });
    } catch (error) {
      console.error("Failed to save guess:", error);
    }

    onComplete?.(guess, accuracy);
  };

  const handleReset = () => {
    setGuess(35);
    setHasGuessed(false);
    setIsRevealing(false);
    onNextAthlete?.();
  };

  const difference = guess - athlete.chronologicalAge;
  const bioAgeDifference = athlete.chronologicalAge - athlete.phenoAge;

  // Memoize accuracy message to avoid recalculation on every render
  const accuracyMessage = useMemo(() => {
    const diff = Math.abs(difference);
    if (diff === 0) return { text: "Perfect! Exactly right!", color: "text-yellow-400" };
    if (diff <= 2) return { text: "Incredible! So close!", color: "text-[var(--color-success)]" };
    if (diff <= 5) return { text: "Great guess!", color: "text-[var(--color-info)]" };
    if (diff <= 10) return { text: "Good try!", color: "text-[var(--color-warning)]" };
    return { text: "Nice attempt!", color: "text-[var(--foreground-secondary)]" };
  }, [difference]);

  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      <CardHeader className="text-center bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20">
        <CardTitle className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-secondary)]" />
          Guess My Age
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Athlete Photo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={isRevealing ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Avatar className="w-40 h-40 border-4 border-[var(--border)] shadow-lg">
              <AvatarImage src={athlete.profilePicture || undefined} />
              <AvatarFallback className="text-4xl">
                {athlete.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <AnimatePresence mode="wait">
            {!hasGuessed ? (
              <motion.p
                key="question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-lg font-medium text-[var(--foreground)]"
              >
                How old is {athlete.displayName.split(" ")[0]}?
              </motion.p>
            ) : (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center"
              >
                <p className="text-lg font-medium text-[var(--foreground)]">
                  {athlete.displayName.split(" ")[0]} is
                </p>
                <p className="text-4xl font-bold text-gradient">
                  {athlete.chronologicalAge} years old
                </p>
                <Badge
                  variant={bioAgeDifference > 0 ? "success" : "warning"}
                  className="mt-2"
                >
                  Bio Age: {athlete.phenoAge.toFixed(1)} ({bioAgeDifference > 0 ? "-" : "+"}
                  {Math.abs(bioAgeDifference).toFixed(1)} yrs)
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Guess Section */}
        <AnimatePresence mode="wait">
          {!hasGuessed ? (
            <motion.div
              key="guess-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Age Display */}
              <div className="text-center">
                <p className="text-6xl font-bold text-[var(--foreground)]">{guess}</p>
                <p className="text-sm text-[var(--foreground-muted)]">years old</p>
              </div>

              {/* Slider */}
              <div className="px-4">
                <Slider
                  value={[guess]}
                  onValueChange={([value]) => setGuess(value)}
                  min={18}
                  max={100}
                  step={1}
                  disabled={isRevealing}
                />
                <div className="flex justify-between text-xs text-[var(--foreground-muted)] mt-2">
                  <span>18</span>
                  <span>100</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmitGuess}
                isLoading={isRevealing}
              >
                {isRevealing ? "Revealing..." : "Submit Guess"}
                <Target className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Result */}
              <div className="text-center p-4 rounded-xl bg-[var(--background-elevated)]">
                <p className="text-sm text-[var(--foreground-muted)] mb-1">Your guess</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{guess}</p>
                <p className={cn("text-lg font-medium mt-2", accuracyMessage.color)}>
                  {accuracyMessage.text}
                </p>
                <p className="text-sm text-[var(--foreground-secondary)]">
                  You were {Math.abs(difference)} year{Math.abs(difference) !== 1 ? "s" : ""}{" "}
                  {difference > 0 ? "over" : difference < 0 ? "under" : "exact"}
                </p>
              </div>

              {/* Fun Fact */}
              <div className="text-center p-3 rounded-lg border border-[var(--border)]">
                <p className="text-sm text-[var(--foreground-secondary)]">
                  {athlete.displayName.split(" ")[0]}&apos;s biological age is{" "}
                  <span className="font-semibold text-[var(--color-primary)]">
                    {athlete.phenoAge.toFixed(1)}
                  </span>
                  {" "}years, which is{" "}
                  <span className={bioAgeDifference > 0 ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"}>
                    {Math.abs(bioAgeDifference).toFixed(1)} years {bioAgeDifference > 0 ? "younger" : "older"}
                  </span>
                  {" "}than their chronological age!
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Button variant="secondary" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});

interface GuessAgeLeaderboardProps {
  topGuessers: {
    userId: string;
    displayName: string;
    totalGuesses: number;
    averageAccuracy: number;
  }[];
}

export const GuessAgeLeaderboard = memo(function GuessAgeLeaderboard({ topGuessers }: GuessAgeLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Guessers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topGuessers.map((guesser, index) => (
            <div
              key={guesser.userId}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-elevated)]"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold",
                    index === 0 && "bg-yellow-500/20 text-yellow-500",
                    index === 1 && "bg-gray-400/20 text-gray-400",
                    index === 2 && "bg-orange-500/20 text-orange-500",
                    index > 2 && "bg-[var(--background-card)] text-[var(--foreground-muted)]"
                  )}
                >
                  {index + 1}
                </span>
                <span className="font-medium text-[var(--foreground)]">
                  {guesser.displayName}
                </span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--color-primary)]">
                  {guesser.averageAccuracy.toFixed(0)}%
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {guesser.totalGuesses} guesses
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
