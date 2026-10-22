import { NextResponse } from 'next/server'
import { requireAuth, canEditBook } from '@/lib/permissions'
import { createBookVersion } from '@/server/services/version.service'
import { uploadFileSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'
import { isPdf } from '@/lib/pdf'
import { logger } from '@/lib/logger'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: bookId } = await params
    
    if (!rateLimit(`upload:${user.id}`, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const hasPermission = await canEditBook(bookId, user.id, user.role)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    const validationResult = uploadFileSchema.safeParse({
      fileSize: file.size,
      fileType: file.type,
    })

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    if (file.type === 'application/pdf' && !(await isPdf(buffer))) {
      return NextResponse.json({ error: 'File bukan PDF valid' }, { status: 400 })
    }

    const version = await createBookVersion({
      bookId,
      userId: user.id,
      file: buffer,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    })

    return NextResponse.json({
      success: true,
      versionId: version.id,
      a5PageCount: version.a5PageCount,
      totalPageCount: version.totalPageCount,
    })
  } catch (error) {
    logger.error('Upload failed', { error })
    return NextResponse.json({ error: 'Gagal mengunggah file' }, { status: 500 })
  }
}
