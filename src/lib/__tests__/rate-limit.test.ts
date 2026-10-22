import { describe, it, expect, beforeEach } from '@jest/globals'
import { rateLimit } from '@/lib/rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit store
    jest.clearAllMocks()
  })

  it('allows requests under limit', () => {
    expect(rateLimit('user1', 3, 1000)).toBe(true)
    expect(rateLimit('user1', 3, 1000)).toBe(true)
    expect(rateLimit('user1', 3, 1000)).toBe(true)
  })

  it('blocks requests over limit', () => {
    rateLimit('user2', 2, 1000)
    rateLimit('user2', 2, 1000)
    expect(rateLimit('user2', 2, 1000)).toBe(false)
  })

  it('resets after window expires', async () => {
    rateLimit('user3', 1, 100)
    expect(rateLimit('user3', 1, 100)).toBe(false)
    
    await new Promise(resolve => setTimeout(resolve, 150))
    expect(rateLimit('user3', 1, 100)).toBe(true)
  })

  it('isolates different identifiers', () => {
    rateLimit('userA', 1, 1000)
    expect(rateLimit('userA', 1, 1000)).toBe(false)
    expect(rateLimit('userB', 1, 1000)).toBe(true)
  })
})
