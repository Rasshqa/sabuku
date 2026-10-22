import { prisma } from "@/lib/prisma"
import { processPdf } from "@/lib/pdf"
import { storage, generateFileKey } from "@/lib/storage"
import { updateBookPageCount } from "./book.service"
import { logger } from "@/lib/logger"

type CreateVersionData = {
  bookId: string
  userId: string
  file: Buffer
  fileName: string
  fileType: string
  fileSize: number
}

export async function createBookVersion(data: CreateVersionData) {
  const { bookId, userId, file, fileName, fileType, fileSize } = data

  try {
    const latestVersion = await prisma.bookVersion.findFirst({
      where: { bookId },
      orderBy: { versionNumber: 'desc' },
    })
    const versionNumber = (latestVersion?.versionNumber ?? 0) + 1

    const version = await prisma.bookVersion.create({
      data: {
        bookId,
        versionNumber,
        originalFileName: fileName,
        originalFileUrl: 'pending',
        fileType,
        fileSize,
        uploadedBy: userId,
        processingStatus: 'processing',
      },
    })

    try {
      const fileKey = generateFileKey(bookId, version.id, fileName)
      await storage.upload(file, fileKey, fileType)

      let pdfResult
      if (fileType === 'application/pdf') {
        pdfResult = await processPdf(file)
      } else {
        logger.warn('Non-PDF upload not supported', { fileType, versionId: version.id })
        pdfResult = { totalPageCount: 0, a5PageCount: 0, nonA5PageCount: 0 }
      }

      await prisma.bookVersion.updateMany({
        where: { bookId, id: { not: version.id } },
        data: { isCurrent: false },
      })

      const updatedVersion = await prisma.bookVersion.update({
        where: { id: version.id },
        data: {
          originalFileUrl: fileKey,
          processedPdfUrl: fileType === 'application/pdf' ? fileKey : null,
          totalPageCount: pdfResult.totalPageCount,
          a5PageCount: pdfResult.a5PageCount,
          nonA5PageCount: pdfResult.nonA5PageCount,
          processingStatus: 'completed',
          isCurrent: true,
        },
      })

      await updateBookPageCount(bookId, pdfResult.a5PageCount)

      await prisma.activity.create({
        data: {
          userId,
          bookId,
          type: 'VERSION_UPLOADED',
          metadata: {
            versionNumber,
            totalPageCount: pdfResult.totalPageCount,
            a5PageCount: pdfResult.a5PageCount,
          },
        },
      })

      return updatedVersion
    } catch (error) {
      await prisma.bookVersion.update({
        where: { id: version.id },
        data: {
          processingStatus: 'failed',
          processingError: error instanceof Error ? error.message : 'Unknown error',
        },
      })
      logger.error('Version processing failed', { versionId: version.id, error })
      throw error
    }
  } catch (error) {
    logger.error('Failed to create version', { bookId, userId, error })
    throw error
  }
}

export async function getBookVersions(bookId: string, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit
    const [versions, total] = await Promise.all([
      prisma.bookVersion.findMany({
        where: { bookId },
        orderBy: { versionNumber: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bookVersion.count({ where: { bookId } }),
    ])
    return { versions, total, page, limit }
  } catch (error) {
    logger.error('Failed to get versions', { bookId, error })
    throw error
  }
}

export async function getVersionById(versionId: string) {
  try {
    return await prisma.bookVersion.findUnique({
      where: { id: versionId },
    })
  } catch (error) {
    logger.error('Failed to get version', { versionId, error })
    throw error
  }
}
