import { NextResponse } from 'next/server'
import { requireAuth, canViewBook } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { storage } from '@/lib/storage'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: bookId } = await params
    const { searchParams } = new URL(req.url)
    const versionId = searchParams.get('versionId')

    const hasPermission = await canViewBook(bookId, user.id, user.role)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get version (specific or latest current)
    const version = versionId
      ? await prisma.bookVersion.findUnique({ where: { id: versionId } })
      : await prisma.bookVersion.findFirst({
          where: { bookId, isCurrent: true },
          orderBy: { versionNumber: 'desc' },
        })

    if (!version || !version.originalFileUrl) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 })
    }

    // Generate presigned URL
    const url = await storage.getSignedUrl(version.originalFileUrl)

    return NextResponse.json({
      url,
      version: {
        id: version.id,
        versionNumber: version.versionNumber,
        totalPageCount: version.totalPageCount,
        a5PageCount: version.a5PageCount,
      },
    })
  } catch (error: any) {
    console.error('Reader API error:', error)
    return NextResponse.json({ error: 'Gagal memuat file' }, { status: 500 })
  }
}
