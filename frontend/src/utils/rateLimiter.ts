/**
 * TripGenius Client Token Bucket & Rate Limit Event Dispatcher
 * 
 * Provides client-side Token Bucket rate limiting and dispatches
 * unified rate limit alert events for endpoint-specific exhaustion
 * (Auth/Login vs Booking/Itinerary vs General API).
 */

export type RateLimitCategory = "auth" | "booking" | "general";

export interface RateLimitAlertDetail {
  category: RateLimitCategory;
  retryAfter: number;
  message?: string;
  endpoint?: string;
}

const RATE_LIMIT_EVENT = "tripgenius:ratelimit:alert";

/**
 * Client-side Token Bucket implementation
 */
class ClientTokenBucket {
  private capacity: number;
  private refillRate: number; // tokens per second
  private tokens: number;
  private lastRefill: number;

  constructor(capacity: number, refillRatePerSec: number) {
    this.capacity = capacity;
    this.refillRate = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  public consume(amount = 1): { allowed: boolean; remaining: number; retryAfter: number } {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    this.lastRefill = now;

    // Refill tokens
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillRate);

    if (this.tokens >= amount) {
      this.tokens -= amount;
      return { allowed: true, remaining: this.tokens, retryAfter: 0 };
    }

    const missing = amount - this.tokens;
    const retryAfter = Math.max(1, Math.ceil(missing / this.refillRate));
    return { allowed: false, remaining: this.tokens, retryAfter };
  }

  public reset(): void {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }
}

// Client-side token buckets for immediate UI protection
// Auth: 5 burst capacity, 5/min refill (1 token every 12s)
// Booking: 10 burst capacity, 10/min refill (1 token every 6s)
// General: 60 burst capacity, 60/min refill (1 token every 1s)
const clientBuckets: Record<RateLimitCategory, ClientTokenBucket> = {
  auth: new ClientTokenBucket(5, 5 / 60),
  booking: new ClientTokenBucket(10, 10 / 60),
  general: new ClientTokenBucket(60, 60 / 60),
};

/**
 * Checks and consumes a token from the client-side bucket.
 * If exhausted, automatically dispatches a popup alert event.
 */
export function checkClientRateLimit(
  category: RateLimitCategory,
  endpoint?: string
): { allowed: boolean; retryAfter: number } {
  const bucket = clientBuckets[category] || clientBuckets.general;
  const result = bucket.consume(1);

  if (!result.allowed) {
    const defaultMessages: Record<RateLimitCategory, string> = {
      auth: "You have exceeded login attempts. Please try again after sometime.",
      booking: "You have exceeded booking and itinerary requests. Please try again after sometime.",
      general: "You are making requests too quickly. Please try again after sometime.",
    };

    triggerRateLimitAlert({
      category,
      retryAfter: result.retryAfter,
      message: defaultMessages[category],
      endpoint,
    });
  }

  return { allowed: result.allowed, retryAfter: result.retryAfter };
}

/**
 * Dispatches a global rate limit alert event for the modal popup to display.
 */
export function triggerRateLimitAlert(detail: RateLimitAlertDetail): void {
  if (typeof window === "undefined") return;

  const event = new CustomEvent<RateLimitAlertDetail>(RATE_LIMIT_EVENT, {
    detail: {
      category: detail.category,
      retryAfter: Math.max(1, detail.retryAfter || 10),
      message: detail.message || "Please try again after sometime.",
      endpoint: detail.endpoint,
    },
  });

  window.dispatchEvent(event);
}

/**
 * Subscribes to rate limit alert events.
 */
export function onRateLimitAlert(callback: (detail: RateLimitAlertDetail) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<RateLimitAlertDetail>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  window.addEventListener(RATE_LIMIT_EVENT, handler);
  return () => window.removeEventListener(RATE_LIMIT_EVENT, handler);
}
