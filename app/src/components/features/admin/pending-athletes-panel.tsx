"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Users, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { PendingAthlete } from "./types";

interface PendingAthletesPanelProps {
  athletes: PendingAthlete[];
  onVerify: (id: string) => Promise<void>;
  processingIds: Set<string>;
}

export function PendingAthletesPanel({
  athletes,
  onVerify,
  processingIds,
}: PendingAthletesPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Pending Athletes
          {athletes.length > 0 && (
            <Badge variant="warning" className="ml-2">
              {athletes.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {athletes.length === 0 ? (
          <div className="text-center py-8 text-[var(--foreground-muted)]">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>All athletes verified!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {athletes.map((athlete) => (
                <motion.div
                  key={athlete.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={athlete.profilePicture || undefined} />
                      <AvatarFallback>
                        {athlete.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {athlete.displayName}
                      </p>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        {athlete.email} • Born {athlete.birthYear} • {athlete.division}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/athletes/${athlete.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-[var(--background-elevated)] rounded transition-colors"
                    >
                      <Eye className="w-4 h-4 text-[var(--foreground-muted)]" />
                    </a>
                    <Button
                      size="sm"
                      onClick={() => onVerify(athlete.id)}
                      isLoading={processingIds.has(athlete.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verify
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
