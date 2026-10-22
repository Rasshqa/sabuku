type RateLimitStore = Map<string, { count: number; resetAt: number }>

const store: RateLimitStore = new Map()

export function rateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = store.get(identifier)

  if (!record || now > record.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key)
    }
  }
}, 60000)
