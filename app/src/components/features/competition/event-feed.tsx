"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  TrendingUp,
  Award,
  Bitcoin,
  Calendar,
  CheckCircle,
  XCircle,
  Bell,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  type: string;
  message: string;
  athleteName?: string;
  athleteSlug?: string;
  athleteImage?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

interface EventFeedProps {
  events: Event[];
  maxEvents?: number;
  className?: string;
  showHeader?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const eventIcons: Record<string, React.ReactNode> = {
  ATHLETE_JOINED: <UserPlus className="w-4 h-4 text-blue-500" />,
  RANK_CHANGED: <TrendingUp className="w-4 h-4 text-purple-500" />,
  BADGE_EARNED: <Award className="w-4 h-4 text-yellow-500" />,
  DONATION_RECEIVED: <Bitcoin className="w-4 h-4 text-orange-500" />,
  SEASON_STARTED: <Calendar className="w-4 h-4 text-green-500" />,
  SEASON_ENDED: <Calendar className="w-4 h-4 text-gray-500" />,
  SUBMISSION_VERIFIED: <CheckCircle className="w-4 h-4 text-green-500" />,
  SUBMISSION_REJECTED: <XCircle className="w-4 h-4 text-red-500" />,
};

const eventColors: Record<string, string> = {
  ATHLETE_JOINED: "border-l-blue-500",
  RANK_CHANGED: "border-l-purple-500",
  BADGE_EARNED: "border-l-yellow-500",
  DONATION_RECEIVED: "border-l-orange-500",
  SEASON_STARTED: "border-l-green-500",
  SEASON_ENDED: "border-l-gray-500",
  SUBMISSION_VERIFIED: "border-l-green-500",
  SUBMISSION_REJECTED: "border-l-red-500",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function EventFeed({
  events: initialEvents,
  maxEvents = 10,
  className,
  showHeader = true,
  autoRefresh = false,
  refreshInterval = 30000,
}: EventFeedProps) {
  const [events, setEvents] = useState(initialEvents.slice(0, maxEvents));

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/events?limit=" + maxEvents);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, maxEvents]);

  return (
    <Card className={className}>
      {showHeader ? <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Feed
          </CardTitle>
        </CardHeader> : null}
      <CardContent className={cn(!showHeader && "pt-6")}>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg bg-[var(--background-elevated)] border-l-4",
                  eventColors[event.type] || "border-l-gray-500"
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {eventIcons[event.type] || <Bell className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--foreground)]">
                    {event.message}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    {formatTimeAgo(event.createdAt)}
                  </p>
                </div>
                {event.athleteImage ? <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={event.athleteImage} />
                    <AvatarFallback className="text-xs">
                      {event.athleteName?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar> : null}
              </motion.div>
            ))}
          </AnimatePresence>

          {events.length === 0 && (
            <div className="text-center py-8 text-[var(--foreground-muted)]">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface LiveEventBannerProps {
  event: Event;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissAfter?: number;
}

export function LiveEventBanner({
  event,
  onDismiss,
  autoDismiss = true,
  dismissAfter = 5000,
}: LiveEventBannerProps) {
  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, dismissAfter);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss, dismissAfter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
    >
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg bg-[var(--background-card)] border shadow-lg",
          eventColors[event.type] || "border-gray-500"
        )}
      >
        <div className="shrink-0">
          {eventIcons[event.type] || <Bell className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <p className="font-medium text-[var(--foreground)]">{event.message}</p>
          <p className="text-xs text-[var(--foreground-muted)]">Just now</p>
        </div>
        {onDismiss ? <button
            onClick={onDismiss}
            className="shrink-0 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            ×
          </button> : null}
      </div>
    </motion.div>
  );
}

interface RecentDonationsProps {
  donations: {
    id: string;
    donorName?: string;
    amountBTC: number;
    amountUSD: number;
    anonymous: boolean;
    createdAt: string;
  }[];
  className?: string;
}

export function RecentDonations({ donations, className }: RecentDonationsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="w-5 h-5 text-orange-500" />
          Recent Donations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {donations.map((donation) => (
            <div
              key={donation.id}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-elevated)]"
            >
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  {donation.anonymous ? "Anonymous" : donation.donorName || "Anonymous"}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {formatTimeAgo(donation.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[var(--color-primary)]">
                  ${donation.amountUSD.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {donation.amountBTC.toFixed(6)} BTC
                </p>
              </div>
            </div>
          ))}

          {donations.length === 0 && (
            <div className="text-center py-8 text-[var(--foreground-muted)]">
              <Bitcoin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No donations yet</p>
              <p className="text-sm mt-1">Be the first to contribute!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
