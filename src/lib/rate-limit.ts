type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function consumeRateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;

  if (buckets.size > 1_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}
