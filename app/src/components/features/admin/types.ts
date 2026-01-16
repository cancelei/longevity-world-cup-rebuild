export interface PendingSubmission {
  id: string;
  athleteId: string;
  athleteName: string;
  athleteEmail: string;
  seasonName: string;
  submittedAt: string;
  phenoAge: number;
  ageReduction: number;
  biomarkers: {
    albumin: number;
    creatinine: number;
    glucose: number;
    crp: number;
    lymphocytePercent: number;
    mcv: number;
    rdw: number;
    alp: number;
    wbc: number;
  };
  proofImages: string[];
}

export interface PendingAthlete {
  id: string;
  displayName: string;
  slug: string;
  email: string;
  profilePicture: string | null;
  birthYear: number;
  division: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  athleteName?: string;
  athleteSlug?: string;
  createdAt: string;
}

export interface AdminStats {
  totalAthletes: number;
  verifiedAthletes: number;
  pendingAthletes: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
