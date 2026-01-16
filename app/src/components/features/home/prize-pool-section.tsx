"use client";

import { Bitcoin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface PrizePoolSectionProps {
  currentBTC: number;
  goalBTC: number;
  currentUSD: number;
  goalUSD: number;
}

export function PrizePoolSection({ currentBTC, goalBTC, currentUSD, goalUSD }: PrizePoolSectionProps) {
  const progressPercent = (currentBTC / goalBTC) * 100;

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card variant="elevated">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-[var(--color-secondary)]/10">
                  <Bitcoin className="h-8 w-8 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Prize Pool</h3>
                  <p className="text-3xl font-bold text-gradient">
                    ${currentUSD.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex-1 w-full md:max-w-xs">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--foreground-secondary)]">Progress</span>
                  <span className="text-[var(--foreground)]">
                    {progressPercent.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progressPercent} variant="success" />
                <p className="text-xs text-[var(--foreground-muted)] mt-1">
                  Goal: ${goalUSD.toLocaleString()}
                </p>
              </div>

              <Button variant="secondary">
                Donate
                <Bitcoin className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
