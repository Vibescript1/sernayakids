/**
 * Client-side rate limiter using a token-bucket pattern.
 * Prevents rapid-fire API calls (login brute-force, cart spam, coupon abuse, etc.)
 * 
 * Tokens are stored in-memory and reset on page reload (acceptable for a frontend guard).
 */

const buckets = new Map();

// Rate limit configurations per action category
const LIMITS = {
  auth:    { maxTokens: 5,  refillRate: 5,  windowMs: 60_000 },  // 5 per minute
  cart:    { maxTokens: 15, refillRate: 15, windowMs: 60_000 },  // 15 per minute
  coupon:  { maxTokens: 3,  refillRate: 3,  windowMs: 60_000 },  // 3 per minute
  order:   { maxTokens: 2,  refillRate: 2,  windowMs: 60_000 },  // 2 per minute
  api:     { maxTokens: 30, refillRate: 30, windowMs: 60_000 },  // 30 per minute
};

/**
 * Get or create a token bucket for the given category.
 */
function getBucket(category) {
  if (!buckets.has(category)) {
    const config = LIMITS[category] || LIMITS.api;
    buckets.set(category, {
      tokens: config.maxTokens,
      lastRefill: Date.now(),
      config,
    });
  }
  return buckets.get(category);
}

/**
 * Refill tokens based on elapsed time since last refill.
 */
function refillBucket(bucket) {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  const { maxTokens, refillRate, windowMs } = bucket.config;

  // Calculate how many tokens to add based on elapsed time
  const tokensToAdd = Math.floor((elapsed / windowMs) * refillRate);
  
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }
}

/**
 * Check if an action is allowed under rate limiting.
 * 
 * @param {string} category - One of 'auth', 'cart', 'coupon', 'order', 'api'
 * @returns {{ allowed: boolean, retryAfter: number }} 
 *   - allowed: true if the action can proceed
 *   - retryAfter: seconds until the next token is available (0 if allowed)
 */
export function checkRateLimit(category) {
  const bucket = getBucket(category);
  refillBucket(bucket);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, retryAfter: 0 };
  }

  // Calculate how long until the next token refills
  const { refillRate, windowMs } = bucket.config;
  const msPerToken = windowMs / refillRate;
  const elapsed = Date.now() - bucket.lastRefill;
  const retryAfterMs = Math.max(0, msPerToken - elapsed);

  return { 
    allowed: false, 
    retryAfter: Math.ceil(retryAfterMs / 1000) 
  };
}

/**
 * Human-readable rate limit message for toast notifications.
 * 
 * @param {string} category - The rate limit category that was exceeded
 * @param {number} retryAfter - Seconds until the next allowed attempt
 * @returns {string} User-friendly message
 */
export function getRateLimitMessage(category, retryAfter) {
  const messages = {
    auth: `Too many login attempts. Please wait ${retryAfter}s before trying again.`,
    cart: `Too many cart updates. Please wait a moment.`,
    coupon: `Too many coupon attempts. Please wait ${retryAfter}s.`,
    order: `Please wait before placing another order.`,
    api: `Too many requests. Please slow down.`,
  };
  return messages[category] || messages.api;
}

/**
 * Reset a specific rate limit bucket (useful after successful auth).
 * 
 * @param {string} category - The category to reset
 */
export function resetRateLimit(category) {
  buckets.delete(category);
}
