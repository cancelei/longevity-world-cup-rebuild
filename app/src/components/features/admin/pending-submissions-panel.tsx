"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, type PendingSubmission } from "./types";

interface PendingSubmissionsPanelProps {
  submissions: PendingSubmission[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  processingIds: Set<string>;
}

export function PendingSubmissionsPanel({
  submissions,
  onApprove,
  onReject,
  processingIds,
}: PendingSubmissionsPanelProps) {
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="w-5 h-5" />
          Pending Submissions
          {submissions.length > 0 && (
            <Badge variant="warning" className="ml-2">
              {submissions.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-[var(--foreground-muted)]">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>All submissions reviewed!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {submissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="border border-[var(--border)] rounded-lg overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-[var(--background-elevated)] transition-colors"
                    onClick={() =>
                      setExpandedSubmission(
                        expandedSubmission === submission.id ? null : submission.id
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">
                            {submission.athleteName}
                          </p>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {submission.seasonName} • {formatDate(submission.submittedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-[var(--foreground-muted)]">PhenoAge</p>
                          <p className="font-semibold text-[var(--color-primary)]">
                            {submission.phenoAge.toFixed(1)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[var(--foreground-muted)]">Reduction</p>
                          <p className="font-semibold text-green-500">
                            -{submission.ageReduction.toFixed(1)} yrs
                          </p>
                        </div>
                        {expandedSubmission === submission.id ? (
                          <ChevronUp className="w-5 h-5 text-[var(--foreground-muted)]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[var(--foreground-muted)]" />
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSubmission === submission.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-[var(--border)]"
                      >
                        <div className="p-4 space-y-4 bg-[var(--background-elevated)]">
                          {/* Biomarkers Grid */}
                          <div>
                            <h4 className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                              Biomarkers
                            </h4>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                              {Object.entries(submission.biomarkers).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="bg-[var(--background-card)] rounded p-2 text-center"
                                >
                                  <p className="text-xs text-[var(--foreground-muted)] capitalize">
                                    {key.replace(/([A-Z])/g, " $1")}
                                  </p>
                                  <p className="font-medium text-[var(--foreground)]">
                                    {value.toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Proof Images */}
                          {submission.proofImages.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                                Proof Images
                              </h4>
                              <div className="flex gap-2 overflow-x-auto">
                                {submission.proofImages.map((url, i) => (
                                  <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0"
                                  >
                                    <Image
                                      src={url}
                                      alt={`Proof ${i + 1}`}
                                      width={96}
                                      height={96}
                                      className="w-24 h-24 object-cover rounded border border-[var(--border)] hover:border-[var(--color-primary)] transition-colors"
                                      unoptimized
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-3 pt-2">
                            <Button
                              variant="success"
                              onClick={() => onApprove(submission.id)}
                              isLoading={processingIds.has(submission.id)}
                              className="flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => onReject(submission.id, "Invalid data")}
                              isLoading={processingIds.has(submission.id)}
                              className="flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
