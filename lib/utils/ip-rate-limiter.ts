/**
 * IP-based Rate Limiting Utility
 * 
 * Provides rate limiting functionality based on IP addresses to prevent
 * abuse and manage resource usage.
 */

interface IPRateLimitOptions {
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
  banThreshold?: number;
  banDurationMinutes?: number;
}

interface IPRateLimitResult {
  allowed: boolean;
  rateLimitStatus: {
    requestsRemainingMinute: number;
    requestsRemainingHour: number;
    banned: boolean;
    banExpiresAt?: Date;
  };
}

export class IpRateLimiter {
  private static maxRequestsPerMinute: number = 30;
  private static maxRequestsPerHour: number = 500;
  private static banThreshold: number = 10;
  private static banDurationMinutes: number = 60;
  
  private static requestLog: Map<string, number[]> = new Map();
  private static bannedIPs: Map<string, Date> = new Map();

  /**
   * Configure global rate limiting options
   */
  public static configure(options: IPRateLimitOptions): void {
    if (options.maxRequestsPerMinute) {
      this.maxRequestsPerMinute = options.maxRequestsPerMinute;
    }
    
    if (options.maxRequestsPerHour) {
      this.maxRequestsPerHour = options.maxRequestsPerHour;
    }
    
    if (options.banThreshold) {
      this.banThreshold = options.banThreshold;
    }
    
    if (options.banDurationMinutes) {
      this.banDurationMinutes = options.banDurationMinutes;
    }
  }

  /**
   * Check if a request from an IP should be allowed
   * @param {string} ipAddress - The IP address of the client
   * @param {string} userId - Optional user ID for additional tracking
   * @returns {Promise<IPRateLimitResult>} - Whether the request should be allowed
   */
  public static async check(ipAddress: string, userId?: string): Promise<IPRateLimitResult> {
    const now = Date.now();
    const key = userId ? `${ipAddress}:${userId}` : ipAddress;
    
    // Check if IP is banned
    if (this.bannedIPs.has(key)) {
      const banExpiration = this.bannedIPs.get(key);
      
      if (banExpiration && banExpiration.getTime() > now) {
        // Still banned
        return {
          allowed: false,
          rateLimitStatus: {
            requestsRemainingMinute: 0,
            requestsRemainingHour: 0,
            banned: true,
            banExpiresAt: banExpiration,
          }
        };
      } else {
        // Ban expired, remove from banned list
        this.bannedIPs.delete(key);
      }
    }
    
    // Initialize request log if it doesn't exist
    if (!this.requestLog.has(key)) {
      this.requestLog.set(key, []);
    }
    
    const ipRequests = this.requestLog.get(key) || [];
    
    // Clean up old requests (older than 1 hour)
    const oneHourAgo = now - (60 * 60 * 1000);
    const filteredRequests = ipRequests.filter((timestamp: number) => timestamp > oneHourAgo);
    
    // Check hourly limit
    if (filteredRequests.length >= this.maxRequestsPerHour) {
      // Ban the IP if it's repeatedly violating limits
      const violationCount = this.getViolationCount(key);
      
      if (violationCount >= this.banThreshold) {
        const banExpiration = new Date(now + this.banDurationMinutes * 60 * 1000);
        this.bannedIPs.set(key, banExpiration);
        
        return {
          allowed: false,
          rateLimitStatus: {
            requestsRemainingMinute: 0,
            requestsRemainingHour: 0,
            banned: true,
            banExpiresAt: banExpiration,
          }
        };
      }
      
      return {
        allowed: false,
        rateLimitStatus: {
          requestsRemainingMinute: 0,
          requestsRemainingHour: 0,
          banned: false,
        }
      };
    }
    
    // Check minute limit
    const oneMinuteAgo = now - (60 * 1000);
    const requestsLastMinute = filteredRequests.filter((timestamp: number) => timestamp > oneMinuteAgo);
    
    if (requestsLastMinute.length >= this.maxRequestsPerMinute) {
      // Increment violation count for this IP
      this.incrementViolationCount(key);
      
      return {
        allowed: false,
        rateLimitStatus: {
          requestsRemainingMinute: 0,
          requestsRemainingHour: Math.max(0, this.maxRequestsPerHour - filteredRequests.length),
          banned: false,
        }
      };
    }
    
    // Record this request
    filteredRequests.push(now);
    this.requestLog.set(key, filteredRequests);
    
    return {
      allowed: true,
      rateLimitStatus: {
        requestsRemainingMinute: Math.max(0, this.maxRequestsPerMinute - requestsLastMinute.length - 1),
        requestsRemainingHour: Math.max(0, this.maxRequestsPerHour - filteredRequests.length - 1),
        banned: false,
      }
    };
  }
  
  // Keep track of how many times an IP has violated rate limits
  private static violationCounts: Map<string, number> = new Map();
  
  private static incrementViolationCount(key: string): void {
    const count = this.violationCounts.get(key) || 0;
    this.violationCounts.set(key, count + 1);
  }
  
  private static getViolationCount(key: string): number {
    return this.violationCounts.get(key) || 0;
  }
  
  /**
   * Remove an IP from the banned list
   * @param {string} ipAddress - The IP address to unban
   * @param {string} userId - Optional user ID
   */
  public static unban(ipAddress: string, userId?: string): void {
    const key = userId ? `${ipAddress}:${userId}` : ipAddress;
    this.bannedIPs.delete(key);
    this.violationCounts.delete(key);
  }
  
  /**
   * Clear all rate limit data (for testing)
   */
  public static reset(): void {
    this.requestLog.clear();
    this.bannedIPs.clear();
    this.violationCounts.clear();
  }
}

export default IpRateLimiter;
