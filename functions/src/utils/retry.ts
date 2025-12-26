/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  jitterPercent: number;
  timeoutMs: number;
}

/**
 * Error types that should NOT be retried
 */
const NON_RETRYABLE_STATUS_CODES = [400, 401, 403, 404];

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  // Don't retry on authentication/authorization errors
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: number }).status;
    if (status && NON_RETRYABLE_STATUS_CODES.includes(status)) {
      return false;
    }
  }

  // Retry on network errors, timeouts, 5xx errors, and 429 rate limits
  return true;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt - 1);
  const jitter = exponentialDelay * (config.jitterPercent / 100);
  const randomJitter = (Math.random() * 2 - 1) * jitter; // Random value between -jitter and +jitter

  return Math.floor(exponentialDelay + randomJitter);
}

/**
 * Extract Retry-After header value in milliseconds
 */
function getRetryAfterMs(error: unknown): number | null {
  if (typeof error !== 'object' || error === null) return null;

  const err = error as { response?: { headers?: Record<string, string> } };
  if (!err.response?.headers) return null;

  const retryAfter = err.response.headers['retry-after'] ||
                     err.response.headers['Retry-After'];

  if (!retryAfter) return null;

  // If it's a number, it's seconds
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000;
  }

  // If it's a date, calculate difference
  const retryDate = new Date(retryAfter);
  if (retryDate.getTime()) {
    return Math.max(0, retryDate.getTime() - Date.now());
  }

  return null;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff and jitter
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
  onRetry?: (attempt: number, error: unknown) => void
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), config.timeoutMs);
      });

      // Race the actual function against the timeout
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;

    } catch (error: unknown) {
      lastError = error;

      // Check if we should retry
      if (attempt > config.maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Calculate delay
      let delayMs: number;

      // Respect Retry-After header for 429 errors
      const errorStatus = typeof error === 'object' && error !== null && 'status' in error
        ? (error as { status?: number }).status
        : undefined;

      if (errorStatus === 429) {
        const retryAfterMs = getRetryAfterMs(error);
        delayMs = retryAfterMs ?? calculateDelay(attempt, config);
      } else {
        delayMs = calculateDelay(attempt, config);
      }

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wait before retrying
      await sleep(delayMs);
    }
  }

  throw lastError;
}
