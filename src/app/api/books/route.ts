import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { createBookSchema } from '@/lib/validations'
import { createBook, getUserBooks } from '@/server/services/book.service'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    
    if (!rateLimit(user.id, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    const body = await req.json()
    
    const validatedData = createBookSchema.parse(body)
    const book = await createBook(user.id, validatedData)
    
    await prisma.activity.create({
      data: {
        userId: user.id,
        bookId: book.id,
        type: 'BOOK_CREATED',
      },
    })

    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    logger.error('Create book failed', { error })
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Gagal membuat buku' }, { status: 400 })
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const result = await getUserBooks(user.id, page, limit)
    return NextResponse.json(result)
  } catch (error) {
    logger.error('Get books failed', { error })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
