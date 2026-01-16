/**
 * Centralized Logging Utility
 *
 * Provides structured, environment-aware logging with log levels.
 * All application logging should go through this module for consistency.
 *
 * ## Usage
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * logger.info('User signed in', { userId: '123' });
 * logger.error('Failed to process payment', error, { orderId: '456' });
 * logger.warn('Rate limit approaching', { remaining: 5 });
 * ```
 *
 * ## Extension Points
 * - Add external logging services (DataDog, Sentry, etc.) in the `send` method
 * - Implement log aggregation by modifying the transport layer
 * - Add request tracing by including correlation IDs in context
 *
 * @module lib/logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Log level hierarchy for filtering
 * Lower number = more verbose
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get minimum log level from environment
 * Defaults to 'info' in production, 'debug' in development
 */
function getMinLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL as LogLevel | undefined;
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

/**
 * Format log entry for console output
 */
function formatConsoleOutput(entry: LogEntry): string {
  const levelColors: Record<LogLevel, string> = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
  };
  const reset = '\x1b[0m';
  const color = levelColors[entry.level];

  let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`;

  if (entry.context && Object.keys(entry.context).length > 0) {
    output += ` ${JSON.stringify(entry.context)}`;
  }

  return output;
}

/**
 * Send log entry to appropriate destinations
 *
 * ## Extension Point: External Logging Services
 * Add integrations here for:
 * - Sentry (error tracking)
 * - DataDog / New Relic (observability)
 * - CloudWatch / Stackdriver (cloud logging)
 * - Elasticsearch (log aggregation)
 *
 * Example:
 * ```typescript
 * if (entry.level === 'error' && process.env.SENTRY_DSN) {
 *   Sentry.captureException(entry.error, { extra: entry.context });
 * }
 * ```
 */
function send(entry: LogEntry): void {
  const minLevel = getMinLevel();

  // Filter by log level
  if (LOG_LEVELS[entry.level] < LOG_LEVELS[minLevel]) {
    return;
  }

  // Console output
  const consoleMethod = entry.level === 'error' ? console.error
    : entry.level === 'warn' ? console.warn
    : console.log;

  if (process.env.NODE_ENV === 'development') {
    // Pretty print in development
    consoleMethod(formatConsoleOutput(entry));
    if (entry.error?.stack) {
      consoleMethod(entry.error.stack);
    }
  } else {
    // JSON format in production for log aggregation
    consoleMethod(JSON.stringify(entry));
  }

  // TODO: Add external service integrations here
  // Example: Sentry, DataDog, CloudWatch
}

/**
 * Create a log entry and send it
 */
function log(level: LogLevel, message: string, error?: Error | null, context?: LogContext): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (context) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  send(entry);
}

/**
 * Logger instance with level-specific methods
 *
 * @example
 * ```typescript
 * // Simple message
 * logger.info('Processing started');
 *
 * // With context
 * logger.info('User action', { userId: '123', action: 'login' });
 *
 * // Error with context
 * logger.error('Database query failed', error, { query: 'SELECT...' });
 *
 * // Warning
 * logger.warn('Deprecated API used', { endpoint: '/v1/old' });
 * ```
 */
export const logger = {
  /**
   * Debug level - verbose information for development
   * Filtered out in production by default
   */
  debug(message: string, context?: LogContext): void {
    log('debug', message, null, context);
  },

  /**
   * Info level - general operational messages
   * User actions, state changes, API requests
   */
  info(message: string, context?: LogContext): void {
    log('info', message, null, context);
  },

  /**
   * Warn level - potentially problematic situations
   * Deprecation notices, retry attempts, approaching limits
   */
  warn(message: string, context?: LogContext): void {
    log('warn', message, null, context);
  },

  /**
   * Error level - errors that need attention
   * Failed operations, exceptions, critical issues
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const err = error instanceof Error ? error : null;
    const ctx = error instanceof Error ? context : (error as LogContext | undefined);
    log('error', message, err, ctx);
  },

  /**
   * Create a child logger with preset context
   * Useful for adding request-scoped data like correlation IDs
   *
   * @example
   * ```typescript
   * const reqLogger = logger.child({ requestId: 'abc-123' });
   * reqLogger.info('Processing request'); // Includes requestId in all logs
   * ```
   */
  child(baseContext: LogContext) {
    return {
      debug: (message: string, context?: LogContext) =>
        log('debug', message, null, { ...baseContext, ...context }),
      info: (message: string, context?: LogContext) =>
        log('info', message, null, { ...baseContext, ...context }),
      warn: (message: string, context?: LogContext) =>
        log('warn', message, null, { ...baseContext, ...context }),
      error: (message: string, error?: Error | unknown, context?: LogContext) => {
        const err = error instanceof Error ? error : null;
        const ctx = error instanceof Error ? context : (error as LogContext | undefined);
        log('error', message, err, { ...baseContext, ...ctx });
      },
    };
  },
};

/**
 * Domain-specific loggers for consistent prefixing
 *
 * ## Usage
 * ```typescript
 * import { domainLoggers } from '@/lib/logger';
 *
 * domainLoggers.ocr.info('Processing started', { jobId: '123' });
 * domainLoggers.email.error('Send failed', error);
 * ```
 */
export const domainLoggers = {
  /** OCR processing logs */
  ocr: logger.child({ domain: 'ocr' }),

  /** Email service logs */
  email: logger.child({ domain: 'email' }),

  /** Authentication logs */
  auth: logger.child({ domain: 'auth' }),

  /** Storage (S3) logs */
  storage: logger.child({ domain: 'storage' }),

  /** API request logs */
  api: logger.child({ domain: 'api' }),

  /** Database operation logs */
  db: logger.child({ domain: 'db' }),
};
