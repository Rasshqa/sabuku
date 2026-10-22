import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { logger } from '@/lib/logger'

type ApiHandler<T = unknown> = (
  req: Request,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse<T>>

type AuthenticatedHandler<T = unknown> = (
  req: Request,
  user: { id: string; email: string; role: string; name: string },
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse<T>>

export function withErrorHandler<T>(handler: ApiHandler<T>): ApiHandler<T> {
  return async (req, context) => {
    try {
      return await handler(req, context)
    } catch (error) {
      logger.error('API error', { 
        error,
        path: new URL(req.url).pathname,
        method: req.method,
      })
      
      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as NextResponse<T>
        }
        if (error.message.includes('not found')) {
          return NextResponse.json({ error: 'Not found' }, { status: 404 }) as NextResponse<T>
        }
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ) as NextResponse<T>
    }
  }
}

export function withAuth<T>(handler: AuthenticatedHandler<T>): ApiHandler<T> {
  return withErrorHandler(async (req, context) => {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) as NextResponse<T>
    }
    
    return handler(req, session.user as any, context)
  })
}

export function withRateLimit(identifier: string, limit: number, windowMs: number) {
  return function<T>(handler: ApiHandler<T>): ApiHandler<T> {
    return async (req, context) => {
      const { rateLimit } = await import('@/lib/rate-limit')
      
      if (!rateLimit(identifier, limit, windowMs)) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        ) as NextResponse<T>
      }
      
      return handler(req, context)
    }
  }
}
