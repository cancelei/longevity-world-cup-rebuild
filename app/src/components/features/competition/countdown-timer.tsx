"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: Date | string;
  title?: string;
  subtitle?: string;
  variant?: "default" | "compact" | "inline";
  onComplete?: () => void;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const difference = targetDate.getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

export function CountdownTimer({
  targetDate,
  title = "Time Remaining",
  subtitle,
  variant = "default",
  onComplete,
  className,
}: CountdownTimerProps) {
  const target = useMemo(
    () => (typeof targetDate === "string" ? new Date(targetDate) : targetDate),
    [targetDate]
  );
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(target));
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(target);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0 && !hasEnded) {
        setHasEnded(true);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [target, hasEnded, onComplete]);

  if (variant === "inline") {
    if (hasEnded) {
      return (
        <span className={cn("text-[var(--color-warning)]", className)}>
          Ended
        </span>
      );
    }

    return (
      <span className={cn("font-mono", className)}>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Clock className="w-4 h-4 text-[var(--foreground-muted)]" />
        {hasEnded ? (
          <span className="text-[var(--color-warning)]">Time&apos;s up!</span>
        ) : (
          <span className="font-mono text-[var(--foreground)]">
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {String(timeLeft.hours).padStart(2, "0")}:
            {String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
          </span>
        )}
      </div>
    );
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;

  return (
    <Card className={cn(isUrgent && "border-[var(--color-warning)]", className)}>
      <CardHeader className={cn(isUrgent && "bg-[var(--color-warning)]/10")}>
        <CardTitle className="flex items-center gap-2">
          {isUrgent ? (
            <AlertCircle className="w-5 h-5 text-[var(--color-warning)]" />
          ) : (
            <Calendar className="w-5 h-5" />
          )}
          {title}
        </CardTitle>
        {subtitle ? <p className="text-sm text-[var(--foreground-muted)]">{subtitle}</p> : null}
      </CardHeader>
      <CardContent>
        {hasEnded ? (
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-[var(--color-warning)]">
              Time&apos;s Up!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map(({ label, value }) => (
              <motion.div
                key={label}
                className="text-center"
                animate={{ scale: label === "Seconds" ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <div
                  className={cn(
                    "text-3xl md:text-4xl font-bold font-mono rounded-lg py-3",
                    isUrgent
                      ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
                      : "bg-[var(--background-elevated)] text-[var(--foreground)]"
                  )}
                >
                  {String(value).padStart(2, "0")}
                </div>
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        {!hasEnded && (
          <p className="text-center text-sm text-[var(--foreground-muted)] mt-4">
            Ends {target.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface SeasonCountdownProps {
  seasonName: string;
  startDate: Date | string;
  endDate: Date | string;
  submissionDeadline: Date | string;
  status: "upcoming" | "active" | "completed";
  className?: string;
}

export function SeasonCountdown({
  seasonName,
  startDate,
  endDate,
  submissionDeadline,
  status,
  className,
}: SeasonCountdownProps) {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const deadline = typeof submissionDeadline === "string" ? new Date(submissionDeadline) : submissionDeadline;

  const now = new Date();

  if (status === "upcoming") {
    return (
      <CountdownTimer
        targetDate={start}
        title={`${seasonName} Starts In`}
        subtitle="Get ready to compete!"
        className={className}
      />
    );
  }

  if (status === "active") {
    const deadlinePassed = now > deadline;

    if (deadlinePassed) {
      return (
        <CountdownTimer
          targetDate={end}
          title={`${seasonName} Ends In`}
          subtitle="Final results coming soon"
          className={className}
        />
      );
    }

    return (
      <CountdownTimer
        targetDate={deadline}
        title="Submission Deadline"
        subtitle={`Submit your biomarkers for ${seasonName}`}
        className={className}
      />
    );
  }

  return (
    <Card className={className}>
      <CardContent className="py-8 text-center">
        <p className="text-lg font-medium text-[var(--foreground)]">
          {seasonName} has ended
        </p>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          View the final results on the leaderboard
        </p>
      </CardContent>
    </Card>
  );
}
