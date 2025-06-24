import { RateLimiter } from '../rate-limiter'

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      maxRequestsPerMinute: 5,
      maxRequestsPerHour: 20,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('check', () => {
    it('allows requests within limits', () => {
      expect(rateLimiter.check('user1')).toBe(true)
      expect(rateLimiter.check('user1')).toBe(true)
      expect(rateLimiter.check('user1')).toBe(true)
    })

    it('blocks requests exceeding minute limit', () => {
      // Use up the minute limit
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.check('user1')).toBe(true)
      }
      
      // Next request should be blocked
      expect(rateLimiter.check('user1')).toBe(false)
    })

    it('blocks requests exceeding hour limit', () => {
      // Create a rate limiter with a low hour limit for testing
      const limitedRateLimiter = new RateLimiter({
        maxRequestsPerMinute: 10,
        maxRequestsPerHour: 3,
      })
      
      // Use up the hour limit
      for (let i = 0; i < 3; i++) {
        expect(limitedRateLimiter.check('user1')).toBe(true)
      }
      
      // Next request should be blocked
      expect(limitedRateLimiter.check('user1')).toBe(false)
    })

    it('tracks different users separately', () => {
      // Use up limit for user1
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.check('user1')).toBe(true)
      }
      expect(rateLimiter.check('user1')).toBe(false)
      
      // user2 should still have full quota
      expect(rateLimiter.check('user2')).toBe(true)
    })

    it('tracks different models separately', () => {
      // Use up limit for default model
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.check('user1', 'default')).toBe(true)
      }
      expect(rateLimiter.check('user1', 'default')).toBe(false)
      
      // Different model should have separate quota
      expect(rateLimiter.check('user1', 'gpt-4')).toBe(true)
    })

    it('logs warnings when limits are exceeded', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      // Use up the minute limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('user1')
      }
      
      // This should trigger a warning
      rateLimiter.check('user1')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limit exceeded (per minute) for user user1')
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('getRemainingQuota', () => {
    it('returns full quota for new user', () => {
      const quota = rateLimiter.getRemainingQuota('newUser')
      expect(quota).toEqual({
        requestsRemainingMinute: 5,
        requestsRemainingHour: 20,
      })
    })

    it('updates quota after requests', () => {
      // Make some requests
      rateLimiter.check('user1')
      rateLimiter.check('user1')
      
      const quota = rateLimiter.getRemainingQuota('user1')
      expect(quota.requestsRemainingMinute).toBe(3)
      expect(quota.requestsRemainingHour).toBe(18)
    })

    it('returns zero when limits are reached', () => {
      // Use up the minute limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('user1')
      }
      
      const quota = rateLimiter.getRemainingQuota('user1')
      expect(quota.requestsRemainingMinute).toBe(0)
    })
  })

  describe('reset', () => {
    it('resets quota for specific user', () => {
      // Use up some quota
      rateLimiter.check('user1')
      rateLimiter.check('user1')
      
      let quota = rateLimiter.getRemainingQuota('user1')
      expect(quota.requestsRemainingMinute).toBe(3)
      
      // Reset quota
      rateLimiter.reset('user1')
      
      quota = rateLimiter.getRemainingQuota('user1')
      expect(quota.requestsRemainingMinute).toBe(5)
    })

    it('only resets specified user', () => {
      // Use quota for both users
      rateLimiter.check('user1')
      rateLimiter.check('user2')
      
      // Reset only user1
      rateLimiter.reset('user1')
      
      const quota1 = rateLimiter.getRemainingQuota('user1')
      const quota2 = rateLimiter.getRemainingQuota('user2')
      
      expect(quota1.requestsRemainingMinute).toBe(5)
      expect(quota2.requestsRemainingMinute).toBe(4)
    })
  })
})