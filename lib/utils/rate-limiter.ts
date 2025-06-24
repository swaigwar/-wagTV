/**
 * AI Rate Limiting Utility
 * 
 * Provides rate limiting functionality for AI model calls to prevent abuse
 * and manage resource usage.
 */

interface RateLimiterOptions {
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
}

interface QuotaInfo {
  requestsRemainingMinute: number;
  requestsRemainingHour: number;
}

class RateLimiter {
  private maxRequestsPerMinute: number;
  private maxRequestsPerHour: number;
  private requestLog: Map<string, number[]>;

  constructor(options: RateLimiterOptions = {}) {
    this.maxRequestsPerMinute = options.maxRequestsPerMinute || 60;
    this.maxRequestsPerHour = options.maxRequestsPerHour || 1000;
    this.requestLog = new Map<string, number[]>();
  }

  /**
   * Check if a request should be allowed based on rate limits
   * @param {string} userId - Unique identifier for the user
   * @param {string} modelId - Optional model identifier for model-specific limits
   * @returns {boolean} - Whether the request should be allowed
   */
  check(userId: string, modelId: string = 'default'): boolean {
    const now = Date.now();
    const key = `${userId}:${modelId}`;
    
    // Initialize user's request log if it doesn't exist
    if (!this.requestLog.has(key)) {
      this.requestLog.set(key, []);
    }
    
    const userRequests = this.requestLog.get(key) || [];
    
    // Clean up old requests (older than 1 hour)
    const oneHourAgo = now - (60 * 60 * 1000);
    const filteredRequests = userRequests.filter((timestamp: number) => timestamp > oneHourAgo);
    
    // Check hourly limit
    if (filteredRequests.length >= this.maxRequestsPerHour) {
      console.warn(`Rate limit exceeded (hourly) for user ${userId}`);
      return false;
    }
    
    // Check minute limit
    const oneMinuteAgo = now - (60 * 1000);
    const requestsLastMinute = filteredRequests.filter((timestamp: number) => timestamp > oneMinuteAgo);
    
    if (requestsLastMinute.length >= this.maxRequestsPerMinute) {
      console.warn(`Rate limit exceeded (per minute) for user ${userId}`);
      return false;
    }
    
    // Record this request
    filteredRequests.push(now);
    this.requestLog.set(key, filteredRequests);
    
    return true;
  }
  
  /**
   * Get remaining quota for a user
   * @param {string} userId - Unique identifier for the user
   * @param {string} modelId - Optional model identifier
   * @returns {Object} - Remaining quota information
   */
  getRemainingQuota(userId: string, modelId: string = 'default'): QuotaInfo {
    const now = Date.now();
    const key = `${userId}:${modelId}`;
    
    if (!this.requestLog.has(key)) {
      return {
        requestsRemainingMinute: this.maxRequestsPerMinute,
        requestsRemainingHour: this.maxRequestsPerHour,
      };
    }
    
    const userRequests = this.requestLog.get(key) || [];
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneMinuteAgo = now - (60 * 1000);
    
    const filteredRequests = userRequests.filter((timestamp: number) => timestamp > oneHourAgo);
    const requestsLastMinute = filteredRequests.filter((timestamp: number) => timestamp > oneMinuteAgo);
    
    return {
      requestsRemainingMinute: Math.max(0, this.maxRequestsPerMinute - requestsLastMinute.length),
      requestsRemainingHour: Math.max(0, this.maxRequestsPerHour - filteredRequests.length),
    };
  }
  
  /**
   * Reset rate limits for a user
   * @param {string} userId - Unique identifier for the user
   * @param {string} modelId - Optional model identifier
   */
  reset(userId: string, modelId: string = 'default'): void {
    const key = `${userId}:${modelId}`;
    this.requestLog.delete(key);
  }
}

// Create a singleton instance
const rateLimiter = new RateLimiter({
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
});

export { RateLimiter };
export default rateLimiter;
