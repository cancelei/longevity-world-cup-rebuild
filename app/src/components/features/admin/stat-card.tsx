"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
}

export function StatCard({ label, value, icon, highlight }: StatCardProps) {
  return (
    <Card className={cn(highlight && "border-yellow-500/50 bg-yellow-500/5")}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--foreground-muted)]">{label}</p>
            <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
