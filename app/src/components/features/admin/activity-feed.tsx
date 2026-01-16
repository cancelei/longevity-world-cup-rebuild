"use client";

import {
  CheckCircle,
  XCircle,
  Users,
  FileCheck,
  Activity,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, type ActivityEvent } from "./types";

interface ActivityFeedProps {
  events: ActivityEvent[];
}

const eventTypeIcons: Record<string, React.ReactNode> = {
  ATHLETE_JOINED: <Users className="w-4 h-4 text-blue-500" />,
  RANK_CHANGED: <Activity className="w-4 h-4 text-purple-500" />,
  BADGE_EARNED: <CheckCircle className="w-4 h-4 text-yellow-500" />,
  SUBMISSION_VERIFIED: <FileCheck className="w-4 h-4 text-green-500" />,
  SUBMISSION_REJECTED: <XCircle className="w-4 h-4 text-red-500" />,
};

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 text-sm">
              <div className="mt-0.5">
                {eventTypeIcons[event.type] || <Activity className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--foreground)]">{event.message}</p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {formatDate(event.createdAt)}
                </p>
              </div>
              {event.athleteSlug ? <a
                  href={`/athletes/${event.athleteSlug}`}
                  className="shrink-0 p-1 hover:bg-[var(--background-elevated)] rounded transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-[var(--foreground-muted)]" />
                </a> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
