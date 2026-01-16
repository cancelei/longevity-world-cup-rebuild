/**
 * In-memory rate limiter for API endpoints
 *
 * For production with multiple instances, consider using:
 * - @upstash/ratelimit with Redis
 * - Rate limiting at the edge (Cloudflare, Vercel Edge Config)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupTimer) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);

  // Don't prevent process from exiting
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with success status and rate limit info
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  startCleanup();

  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  // If no entry or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowSeconds * 1000;
    rateLimitStore.set(key, { count: 1, resetTime });

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Pre-configured rate limiters for different API types
 */
export const rateLimiters = {
  /** General API: 100 requests per minute */
  api: (identifier: string) => checkRateLimit(identifier, { limit: 100, windowSeconds: 60 }),

  /** Auth endpoints: 10 requests per minute (stricter for security) */
  auth: (identifier: string) => checkRateLimit(`auth:${identifier}`, { limit: 10, windowSeconds: 60 }),

  /** Submissions: 5 per minute (resource intensive) */
  submission: (identifier: string) => checkRateLimit(`submit:${identifier}`, { limit: 5, windowSeconds: 60 }),

  /** OCR uploads: 3 per minute (very resource intensive) */
  ocr: (identifier: string) => checkRateLimit(`ocr:${identifier}`, { limit: 3, windowSeconds: 60 }),

  /** Admin actions: 30 per minute */
  admin: (identifier: string) => checkRateLimit(`admin:${identifier}`, { limit: 30, windowSeconds: 60 }),
};

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header if behind proxy, falls back to a default
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback for development or missing headers
  return "unknown";
}

/**
 * Create rate limit response with proper headers
 */
export function createRateLimitResponse(result: ReturnType<typeof checkRateLimit>) {
  const headers = new Headers({
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
    "Content-Type": "application/json",
  });

  if (!result.success) {
    headers.set("Retry-After", Math.ceil((result.reset - Date.now()) / 1000).toString());
  }

  return {
    headers,
    status: result.success ? 200 : 429,
  };
}
