import { prisma } from "@/lib/prisma"
import { CreateBookInput, UpdateBookInput } from "@/lib/validations"
import { BookStatus } from "@prisma/client"
import { storage } from "@/lib/storage"
import { logger } from "@/lib/logger"

const DEFAULT_MILESTONES = [
  { title: 'Menentukan ide', order: 1 },
  { title: 'Membuat outline', order: 2 },
  { title: 'Mulai menulis', order: 3 },
  { title: 'Menyelesaikan 15 halaman', order: 4 },
  { title: 'Menyelesaikan 30 halaman', order: 5 },
  { title: 'Menyelesaikan 45 halaman', order: 6 },
  { title: 'Menyelesaikan 60 halaman', order: 7 },
  { title: 'Review pembimbing', order: 8 },
  { title: 'Revisi', order: 9 },
  { title: 'Finalisasi', order: 10 },
]

export async function createBook(ownerId: string, data: CreateBookInput) {
  try {
    return await prisma.book.create({
      data: {
        ...data,
        ownerId,
        status: 'CONCEPT',
        milestones: {
          create: DEFAULT_MILESTONES,
        },
      },
      include: {
        milestones: true,
      },
    })
  } catch (error) {
    logger.error('Failed to create book', { ownerId, error })
    throw error
  }
}

export async function updateBook(bookId: string, data: UpdateBookInput) {
  try {
    return await prisma.book.update({
      where: { id: bookId },
      data,
    })
  } catch (error) {
    logger.error('Failed to update book', { bookId, error })
    throw error
  }
}

export async function getBookById(bookId: string) {
  try {
    return await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: {
            feedbacks: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
  } catch (error) {
    logger.error('Failed to get book', { bookId, error })
    throw error
  }
}

export async function getUserBooks(userId: string, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: { ownerId: userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.book.count({ where: { ownerId: userId } }),
    ])
    return { books, total, page, limit }
  } catch (error) {
    logger.error('Failed to get user books', { userId, error })
    throw error
  }
}

export async function deleteBook(bookId: string) {
  try {
    const versions = await prisma.bookVersion.findMany({
      where: { bookId },
      select: { originalFileUrl: true, processedPdfUrl: true },
    })

    for (const version of versions) {
      if (version.originalFileUrl) {
        await storage.delete(version.originalFileUrl).catch((err) => 
          logger.warn('Failed to delete file', { key: version.originalFileUrl, error: err })
        )
      }
      if (version.processedPdfUrl && version.processedPdfUrl !== version.originalFileUrl) {
        await storage.delete(version.processedPdfUrl).catch((err) =>
          logger.warn('Failed to delete file', { key: version.processedPdfUrl, error: err })
        )
      }
    }

    return await prisma.book.delete({
      where: { id: bookId },
    })
  } catch (error) {
    logger.error('Failed to delete book', { bookId, error })
    throw error
  }
}

export async function updateBookPageCount(bookId: string, a5PageCount: number) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { status: true },
    })

    let newStatus: BookStatus | undefined
    if (book?.status === 'NOT_STARTED' || book?.status === 'CONCEPT') {
      if (a5PageCount > 0) {
        newStatus = 'WRITING'
      }
    }

    return await prisma.book.update({
      where: { id: bookId },
      data: {
        a5PageCount,
        currentPageCount: a5PageCount,
        ...(newStatus && { status: newStatus }),
      },
    })
  } catch (error) {
    logger.error('Failed to update book page count', { bookId, a5PageCount, error })
    throw error
  }
}
