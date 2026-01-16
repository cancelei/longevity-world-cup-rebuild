// Core domain types for Longevity World Cup

export type Division = "mens" | "womens" | "open";
export type Generation = "silent" | "boomer" | "genx" | "millennial" | "genz" | "genalpha";
export type AthleteStatus = "pending" | "verified" | "suspended";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type SeasonStatus = "upcoming" | "active" | "completed";

// League types
export type LeagueType = "CLINIC" | "CORPORATE" | "COLLECTIVE" | "GEOGRAPHIC" | "CUSTOM";
export type LeagueTier = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
export type LeagueMemberRole = "MEMBER" | "CAPTAIN" | "ADMIN";
export type LeagueStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED";

export interface Athlete {
  id: string;
  userId: string;
  displayName: string;
  slug: string;
  email?: string;
  profilePicture?: string;
  chronologicalAge: number;
  birthYear: number;
  division: Division;
  generation: Generation;
  status: AthleteStatus;
  verified: boolean;
  verifiedAt?: Date;
  mediaContact?: string;
  personalLinks?: string[];
  badges: Badge[];
  leagueMemberships?: LeagueMembership[]; // Athletes MUST belong to at least 1 league
  createdAt: Date;
  updatedAt: Date;
}

export interface BiomarkerSubmission {
  id: string;
  athleteId: string;
  seasonId: string;
  leagueId: string; // REQUIRED - all submissions tied to league context
  submittedAt: Date;
  biomarkers: Biomarkers;
  phenoAge: number;
  ageReduction: number;
  paceOfAging: number;
  proofImages: string[];
  status: SubmissionStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  notes?: string;
}

export interface Biomarkers {
  albumin: number;
  creatinine: number;
  glucose: number;
  crp: number;
  lymphocytePercent: number;
  mcv: number;
  rdw: number;
  alp: number;
  wbc: number;
}

export interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  athlete: Athlete;
  latestSubmission: BiomarkerSubmission;
  submissionCount: number;
  bestAgeReduction: number;
  divisionRank?: number;
  generationRank?: number;
  isNew?: boolean;
  rankChange?: number;
}

export interface Season {
  id: string;
  name: string;
  year: number;
  startDate: Date;
  endDate: Date;
  submissionDeadline: Date;
  status: SeasonStatus;
  prizePool: PrizePool;
  athleteCount: number;
  submissionCount: number;
}

export interface PrizePool {
  totalBTC: number;
  totalUSD: number;
  goalBTC: number;
  goalUSD: number;
  distribution: {
    first: number;   // percentage (e.g., 60)
    second: number;  // percentage (e.g., 25)
    third: number;   // percentage (e.g., 15)
  };
  bitcoinAddress: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: BadgeCategory;
}

export type BadgeCategory =
  | "achievement"
  | "milestone"
  | "competition"
  | "community"
  | "special";

export interface GuessMyAgeGame {
  athleteId: string;
  guesses: AgeGuess[];
  averageGuess: number;
  correctAnswer: number;
}

export interface AgeGuess {
  id: string;
  visitorId: string;
  guessedAge: number;
  actualAge: number;
  difference: number;
  guessedAt: Date;
}

export interface Event {
  id: string;
  type: EventType;
  athleteId?: string;
  athleteName?: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: Date;
}

export type EventType =
  | "athlete_joined"
  | "rank_changed"
  | "badge_earned"
  | "donation_received"
  | "season_started"
  | "season_ended"
  | "submission_verified";

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// Filter types for leaderboard
export interface LeaderboardFilters {
  division?: Division | "all";
  generation?: Generation | "all";
  search?: string;
  seasonId?: string;
}

// Chart data types
export interface BiomarkerChartData {
  date: string;
  phenoAge: number;
  chronologicalAge: number;
  albumin?: number;
  creatinine?: number;
  glucose?: number;
  crp?: number;
  lymphocytePercent?: number;
  mcv?: number;
  rdw?: number;
  alp?: number;
  wbc?: number;
}

export interface RankHistoryData {
  date: string;
  rank: number;
  ageReduction: number;
}

// ============================================
// League Types
// ============================================

export interface League {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  type: LeagueType;
  tier: LeagueTier;
  country?: string;
  city?: string;
  status: LeagueStatus;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  ownerId: string;
  owner?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  memberCount?: number;
  activeMembers?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeagueMembership {
  id: string;
  leagueId: string;
  league?: League;
  athleteId: string;
  athlete?: Athlete;
  role: LeagueMemberRole;
  joinedAt: Date;
}

export interface LeagueLeaderboardEntry {
  rank: number;
  previousRank?: number;
  league: League;
  avgAgeReduction: number;
  totalMembers: number;
  activeMembers: number;
  bestIndividual: number;
  worstIndividual: number;
  rankChange?: number;
  isNew?: boolean;
}

export interface LeagueSubscription {
  id: string;
  leagueId: string;
  tier: LeagueTier;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  status: SubscriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

// League tier limits
export const LEAGUE_TIER_LIMITS: Record<LeagueTier, number> = {
  FREE: 10,
  STARTER: 50,
  PRO: 250,
  ENTERPRISE: Infinity,
};

// Max leagues per athlete
export const MAX_LEAGUES_PER_ATHLETE = 3;

// Filter types for league leaderboard
export interface LeagueFilters {
  type?: LeagueType | "all";
  tier?: LeagueTier | "all";
  country?: string;
  search?: string;
  seasonId?: string;
}

// League creation/update input
export interface LeagueInput {
  name: string;
  slug?: string;
  description?: string;
  type: LeagueType;
  country?: string;
  city?: string;
}

// League invite
export interface LeagueInvite {
  id: string;
  leagueId: string;
  email: string;
  role: LeagueMemberRole;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}
