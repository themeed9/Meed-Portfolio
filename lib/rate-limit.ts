type Entry = { count: number; resetAt: number };
type LoginEntry = { failures: number; windowStartedAt: number; blockedUntil: number };

const buckets = new Map<string, Entry>();
const loginBuckets = new Map<string, LoginEntry>();

export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function checkLoginRateLimit(key: string, now = Date.now()) {
  const entry = loginBuckets.get(key);
  if (!entry) return { allowed: true, retryAfterSeconds: 0 };
  if (entry.blockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000) };
  }
  if (entry.windowStartedAt + 15 * 60 * 1000 <= now) loginBuckets.delete(key);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordLoginFailure(key: string, now = Date.now()) {
  const windowMs = 15 * 60 * 1000;
  const cooldownMs = 15 * 60 * 1000;
  const current = loginBuckets.get(key);
  const entry = !current || current.windowStartedAt + windowMs <= now
    ? { failures: 0, windowStartedAt: now, blockedUntil: 0 }
    : current;

  entry.failures += 1;
  if (entry.failures >= 5) entry.blockedUntil = now + cooldownMs;
  loginBuckets.set(key, entry);
  return { blocked: entry.blockedUntil > now };
}

export function clearLoginFailures(key: string) {
  loginBuckets.delete(key);
}
