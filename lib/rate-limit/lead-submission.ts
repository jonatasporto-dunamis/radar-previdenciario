const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export type LeadSubmissionRateLimitResult =
  { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function checkLeadSubmissionRateLimit(
  ipAddress: string | null | undefined,
): LeadSubmissionRateLimitResult {
  if (!ipAddress) {
    return { allowed: true };
  }

  const now = Date.now();
  const current = buckets.get(ipAddress);

  if (!current || current.resetAt <= now) {
    buckets.set(ipAddress, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return { allowed: true };
  }

  current.count += 1;

  if (current.count > MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  return { allowed: true };
}
