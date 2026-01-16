"use client";

import { useState } from "react";
import { Users, CheckCircle, Clock, FileCheck, AlertTriangle } from "lucide-react";
import {
  StatCard,
  PendingSubmissionsPanel,
  PendingAthletesPanel,
  ActivityFeed,
  type PendingSubmission,
  type PendingAthlete,
  type ActivityEvent,
  type AdminStats,
} from "@/components/features/admin";

interface AdminDashboardClientProps {
  pendingSubmissions: PendingSubmission[];
  pendingAthletes: PendingAthlete[];
  recentActivity: ActivityEvent[];
  stats: AdminStats;
}

export function AdminDashboardClient({
  pendingSubmissions: initialSubmissions,
  pendingAthletes: initialAthletes,
  recentActivity,
  stats,
}: AdminDashboardClientProps) {
  const [pendingSubmissions, setPendingSubmissions] = useState(initialSubmissions);
  const [pendingAthletes, setPendingAthletes] = useState(initialAthletes);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleApproveSubmission = async (id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      const response = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: "POST",
      });
      if (response.ok) {
        setPendingSubmissions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Failed to approve submission:", error);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleRejectSubmission = async (id: string, reason: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      const response = await fetch(`/api/admin/submissions/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (response.ok) {
        setPendingSubmissions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Failed to reject submission:", error);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleVerifyAthlete = async (id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      const response = await fetch(`/api/admin/athletes/${id}/verify`, {
        method: "POST",
      });
      if (response.ok) {
        setPendingAthletes((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Failed to verify athlete:", error);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              Admin Dashboard
            </h1>
            <p className="text-[var(--foreground-muted)] mt-1">
              Manage athletes and verify submissions
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Athletes"
            value={stats.totalAthletes}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            label="Verified"
            value={stats.verifiedAthletes}
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          />
          <StatCard
            label="Pending Athletes"
            value={stats.pendingAthletes}
            icon={<Clock className="w-5 h-5 text-yellow-500" />}
            highlight={stats.pendingAthletes > 0}
          />
          <StatCard
            label="Total Submissions"
            value={stats.totalSubmissions}
            icon={<FileCheck className="w-5 h-5" />}
          />
          <StatCard
            label="Approved"
            value={stats.approvedSubmissions}
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          />
          <StatCard
            label="Pending Review"
            value={stats.pendingSubmissions}
            icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
            highlight={stats.pendingSubmissions > 0}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Pending Items */}
          <div className="lg:col-span-2 space-y-4">
            <PendingSubmissionsPanel
              submissions={pendingSubmissions}
              onApprove={handleApproveSubmission}
              onReject={handleRejectSubmission}
              processingIds={processingIds}
            />
            <PendingAthletesPanel
              athletes={pendingAthletes}
              onVerify={handleVerifyAthlete}
              processingIds={processingIds}
            />
          </div>

          {/* Right Column - Activity Feed */}
          <ActivityFeed events={recentActivity} />
        </div>
      </div>
    </div>
  );
}
