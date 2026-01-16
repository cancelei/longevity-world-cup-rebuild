"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bitcoin, DollarSign, Trophy, Target, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PrizePoolProps {
  currentBTC: number;
  currentUSD: number;
  goalBTC: number;
  goalUSD: number;
  bitcoinAddress: string;
  distribution: {
    first: number;
    second: number;
    third: number;
  };
  className?: string;
}

export function PrizePoolDisplay({
  currentBTC,
  currentUSD,
  goalBTC,
  goalUSD,
  bitcoinAddress,
  distribution,
  className,
}: PrizePoolProps) {
  const [copied, setCopied] = useState(false);
  const [displayUSD, setDisplayUSD] = useState(0);
  const [displayBTC, setDisplayBTC] = useState(0);

  const progress = (currentBTC / goalBTC) * 100;

  // Animate numbers on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic

      setDisplayUSD(Math.round(currentUSD * eased));
      setDisplayBTC(currentBTC * eased);

      if (step >= steps) clearInterval(interval);
    }, stepDuration);

    return () => clearInterval(interval);
  }, [currentUSD, currentBTC]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(bitcoinAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const firstPrize = currentUSD * (distribution.first / 100);
  const secondPrize = currentUSD * (distribution.second / 100);
  const thirdPrize = currentUSD * (distribution.third / 100);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-amber-500/20 to-orange-500/20">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Prize Pool
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Main Prize Display */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-center gap-2 text-[var(--foreground-muted)]">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm">Total Prize Pool</span>
            </div>
            <p className="text-5xl font-bold text-gradient">
              ${displayUSD.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-1 text-[var(--foreground-secondary)]">
              <Bitcoin className="w-4 h-4 text-orange-500" />
              <span>{displayBTC.toFixed(4)} BTC</span>
            </div>
          </motion.div>
        </div>

        {/* Progress to Goal */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--foreground-muted)]">Progress to Goal</span>
            <span className="text-[var(--foreground-secondary)]">
              {progress.toFixed(1)}%
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
            <span>${currentUSD.toLocaleString()}</span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              Goal: ${goalUSD.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Prize Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[var(--foreground-secondary)]">
            Distribution
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                place: "1st",
                amount: firstPrize,
                pct: distribution.first,
                color: "text-yellow-500",
                bg: "bg-yellow-500/10",
              },
              {
                place: "2nd",
                amount: secondPrize,
                pct: distribution.second,
                color: "text-gray-400",
                bg: "bg-gray-400/10",
              },
              {
                place: "3rd",
                amount: thirdPrize,
                pct: distribution.third,
                color: "text-orange-500",
                bg: "bg-orange-500/10",
              },
            ].map((prize) => (
              <div
                key={prize.place}
                className={cn("p-3 rounded-lg text-center", prize.bg)}
              >
                <p className={cn("text-sm font-medium", prize.color)}>
                  {prize.place}
                </p>
                <p className="text-lg font-bold text-[var(--foreground)]">
                  ${prize.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {prize.pct}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bitcoin Donation Address */}
        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
          <h4 className="text-sm font-medium text-[var(--foreground-secondary)] flex items-center gap-2">
            <Bitcoin className="w-4 h-4 text-orange-500" />
            Donate to Prize Pool
          </h4>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 text-xs bg-[var(--background-elevated)] rounded-lg font-mono text-[var(--foreground-secondary)] truncate">
              {bitcoinAddress}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAddress}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            All donations go directly to the prize pool
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface MiniPrizePoolProps {
  currentUSD: number;
  goalUSD: number;
  className?: string;
}

export function MiniPrizePool({ currentUSD, goalUSD, className }: MiniPrizePoolProps) {
  const progress = (currentUSD / goalUSD) * 100;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Trophy className="w-5 h-5 text-yellow-500" />
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-[var(--foreground)]">
            ${currentUSD.toLocaleString()}
          </span>
          <span className="text-[var(--foreground-muted)]">
            {progress.toFixed(0)}%
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
    </div>
  );
}
