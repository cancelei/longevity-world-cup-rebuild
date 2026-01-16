/**
 * API Utilities - Infrastructure Layer for API Routes
 *
 * Provides common patterns and utilities for 40+ API route handlers.
 * This is part of the INFRASTRUCTURE layer in DDD terms.
 *
 * ## Key Abstractions
 * - **Authentication**: ensureAuth, ensureAdmin, ensureAthlete
 * - **Rate Limiting**: checkRateLimitOrError with configurable limits
 * - **Pagination**: parsePagination, createPaginatedResponse
 * - **Error Handling**: handleApiError with Prisma-aware error classification
 *
 * ## Extension Points
 * - Add new error types: Extend ApiHttpError class hierarchy
 * - Add rate limit tiers: Extend RateLimitType union
 * - Add auth contexts: Create new ensure* functions
 * - Add query fragments: Extend *Include constants
 *
 * ## Usage Pattern
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const authResult = await ensureAuth();
 *   if (!authResult.success) return authResult.response;
 *
 *   const rateLimitError = checkRateLimitOrError(request, 'api');
 *   if (rateLimitError) return rateLimitError;
 *
 *   // ... handler logic
 * }
 * ```
 *
 * @module lib/api-utils
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { rateLimiters, getClientIdentifier, createRateLimitResponse } from "@/lib/rate-limit";

// ============================================
// Types
// ============================================

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface AuthContext {
  userId: string;
  clerkId: string;
}

export interface AthleteContext extends AuthContext {
  athlete: {
    id: string;
    userId: string;
    displayName: string;
    slug: string;
    division: string;
    generation: string;
    status: string;
    verified: boolean;
  };
}

export interface AdminContext extends AuthContext {
  user: {
    id: string;
    role: string;
  };
}

export interface UserContext extends AuthContext {
  user: {
    id: string;
    clerkId: string;
    email: string;
    role: string;
  };
}

// ============================================
// Authentication Helpers
// ============================================

/**
 * Ensure request is authenticated
 * @returns AuthContext with userId or throws/returns error response
 */
export async function ensureAuth(): Promise<
  | { success: true; context: AuthContext }
  | { success: false; response: NextResponse<ApiError> }
> {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return {
    success: true,
    context: { userId, clerkId: userId },
  };
}

/**
 * Ensure request is from an admin user
 */
export async function ensureAdmin(): Promise<
  | { success: true; context: AdminContext }
  | { success: false; response: NextResponse<ApiError> }
> {
  const authResult = await ensureAuth();
  if (!authResult.success) {
    return authResult;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: authResult.context.clerkId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    context: {
      ...authResult.context,
      user,
    },
  };
}

/**
 * Get authenticated user's athlete profile
 */
export async function ensureAthlete(): Promise<
  | { success: true; context: AthleteContext }
  | { success: false; response: NextResponse<ApiError> }
> {
  const authResult = await ensureAuth();
  if (!authResult.success) {
    return authResult;
  }

  const athlete = await prisma.athlete.findFirst({
    where: {
      user: {
        clerkId: authResult.context.clerkId,
      },
    },
    select: {
      id: true,
      userId: true,
      displayName: true,
      slug: true,
      division: true,
      generation: true,
      status: true,
      verified: true,
    },
  });

  if (!athlete) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Athlete profile not found", needsOnboarding: true },
        { status: 404 }
      ),
    };
  }

  return {
    success: true,
    context: {
      ...authResult.context,
      athlete,
    },
  };
}

/**
 * Ensure request has a User record in database
 * Creates one from Clerk data if it doesn't exist
 */
export async function ensureUser(): Promise<
  | { success: true; context: UserContext }
  | { success: false; response: NextResponse<ApiError> }
> {
  const authResult = await ensureAuth();
  if (!authResult.success) {
    return authResult;
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: authResult.context.clerkId },
    select: { id: true, clerkId: true, email: true, role: true },
  });

  if (!user) {
    // Create user from Clerk data
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Unable to fetch user data", needsOnboarding: true },
          { status: 404 }
        ),
      };
    }

    user = await prisma.user.create({
      data: {
        clerkId: authResult.context.clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        role: "ATHLETE",
      },
      select: { id: true, clerkId: true, email: true, role: true },
    });
  }

  return {
    success: true,
    context: {
      ...authResult.context,
      user,
    },
  };
}

// ============================================
// Rate Limiting Helpers
// ============================================

type RateLimitType = "api" | "auth" | "submission" | "ocr" | "admin";

/**
 * Check rate limit and return error response if exceeded
 */
export function checkRateLimitOrError(
  request: NextRequest,
  type: RateLimitType = "api"
): NextResponse<ApiError> | null {
  const clientId = getClientIdentifier(request);
  const rateLimit = rateLimiters[type](clientId);

  if (!rateLimit.success) {
    const { headers } = createRateLimitResponse(rateLimit);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers }
    );
  }

  return null;
}

// ============================================
// Pagination Helpers
// ============================================

/**
 * Parse pagination parameters from URL search params
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { page?: number; limit?: number } = {}
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || String(defaults.page || 1)));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(defaults.limit || 20))));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

/**
 * Create pagination metadata for response
 */
export function createPaginationMeta(
  params: PaginationParams,
  totalCount: number
): PaginationMeta {
  return {
    page: params.page,
    pageSize: params.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / params.limit),
    hasMore: params.page * params.limit < totalCount,
  };
}

/**
 * Create a full paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  params: PaginationParams,
  totalCount: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMeta(params, totalCount),
  };
}

// ============================================
// Error Classes
// ============================================

export class ApiHttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiHttpError";
  }
}

export class BadRequestError extends ApiHttpError {
  constructor(message: string, details?: unknown) {
    super(400, message, details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends ApiHttpError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiHttpError {
  constructor(message: string = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiHttpError {
  constructor(message: string = "Resource not found") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiHttpError {
  constructor(message: string = "Resource already exists") {
    super(409, message);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends ApiHttpError {
  constructor(message: string = "Too many requests") {
    super(429, message);
    this.name = "RateLimitError";
  }
}

// ============================================
// Error Handling
// ============================================

/**
 * Classify and handle Prisma-specific errors
 */
function handlePrismaError(error: unknown): NextResponse<ApiError> | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": // Unique constraint violation
        const field = (error.meta?.target as string[])?.join(", ") || "field";
        return NextResponse.json(
          { error: `A record with this ${field} already exists` },
          { status: 409 }
        );
      case "P2025": // Record not found
        return NextResponse.json(
          { error: "Resource not found" },
          { status: 404 }
        );
      case "P2003": // Foreign key constraint failed
        return NextResponse.json(
          { error: "Referenced resource not found" },
          { status: 400 }
        );
      case "P2014": // Required relation violation
        return NextResponse.json(
          { error: "Required relation is missing" },
          { status: 400 }
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { error: "Invalid data format" },
      { status: 400 }
    );
  }

  return null;
}

/**
 * Standard API error handler wrapper
 */
export function handleApiError(
  error: unknown,
  action: string
): NextResponse<ApiError> {
  console.error(`Error ${action}:`, error);

  // Handle custom HTTP errors
  if (error instanceof ApiHttpError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode }
    );
  }

  // Handle Prisma-specific errors
  const prismaResponse = handlePrismaError(error);
  if (prismaResponse) {
    return prismaResponse;
  }

  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === "development"
    ? `Failed to ${action}: ${error instanceof Error ? error.message : "Unknown error"}`
    : `Failed to ${action}`;

  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}

/**
 * Create an API route handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>,
  action: string
): Promise<NextResponse<T | ApiError>> {
  return handler().catch((error) => handleApiError(error, action));
}

type ApiHandler<T = unknown> = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse<T>>;

/**
 * Wrap an API route handler with consistent error handling, rate limiting, and logging
 */
export function withApiHandler<T = unknown>(
  handler: ApiHandler<T>,
  options: {
    action: string;
    rateLimit?: RateLimitType;
  }
): ApiHandler<T | ApiError> {
  return async (request, context) => {
    try {
      // Apply rate limiting if specified
      if (options.rateLimit) {
        const rateLimitError = checkRateLimitOrError(request, options.rateLimit);
        if (rateLimitError) {
          return rateLimitError as NextResponse<ApiError>;
        }
      }

      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, options.action);
    }
  };
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate required fields in request body
 */
export function validateRequired<T extends Record<string, unknown>>(
  body: T,
  fields: (keyof T)[]
): { valid: true } | { valid: false; response: NextResponse<ApiError> } {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null);

  if (missing.length > 0) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      ),
    };
  }

  return { valid: true };
}

/**
 * Safe JSON parse with error response
 */
export function safeJsonParse<T>(
  json: string,
  fieldName: string = "data"
): { success: true; data: T } | { success: false; response: NextResponse<ApiError> } {
  try {
    return { success: true, data: JSON.parse(json) as T };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: `Invalid ${fieldName} JSON format` },
        { status: 400 }
      ),
    };
  }
}

// ============================================
// Common Query Fragments
// ============================================

/**
 * Common include for athlete with badges
 */
export const athleteWithBadgesInclude = {
  badges: {
    include: {
      badge: true,
    },
  },
} as const;

/**
 * Common include for athlete with submissions
 */
export const athleteWithSubmissionsInclude = {
  submissions: {
    orderBy: { submittedAt: "desc" as const },
    take: 10,
  },
} as const;

/**
 * Common include for athlete with full profile
 */
export const athleteFullInclude = {
  ...athleteWithBadgesInclude,
  ...athleteWithSubmissionsInclude,
  leaderboardEntries: {
    orderBy: { updatedAt: "desc" as const },
    take: 1,
  },
  leagueMemberships: {
    include: {
      league: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
        },
      },
    },
  },
  _count: {
    select: { submissions: true },
  },
} as const;

// ============================================
// Event Creation Helper
// ============================================

type EventType =
  | "ATHLETE_JOINED"
  | "RANK_CHANGED"
  | "BADGE_EARNED"
  | "SUBMISSION_VERIFIED"
  | "SUBMISSION_REJECTED";

/**
 * Create a standardized event
 */
export async function createEvent(params: {
  type: EventType;
  athleteId?: string;
  seasonId?: string;
  message: string;
  data?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.event.create({
    data: {
      type: params.type,
      athleteId: params.athleteId,
      seasonId: params.seasonId,
      message: params.message,
      data: params.data !== undefined ? params.data : Prisma.JsonNull,
    },
  });
}

// ============================================
// Email Helper
// ============================================

/**
 * Send email asynchronously without blocking the response
 */
export function sendEmailAsync(
  emailFn: () => Promise<unknown>,
  context: string
): void {
  emailFn().catch((err) => {
    console.error(`Failed to send ${context} email:`, err);
  });
}
