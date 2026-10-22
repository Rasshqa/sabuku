import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const updateProfileSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50).regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore").optional(),
  password: z.string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter")
    .optional(),
  currentPassword: z.string().optional(),
})

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { username, password, currentPassword } = updateProfileSchema.parse(body)

    if (!username && !password) {
      return NextResponse.json({ error: 'Tidak ada data yang diubah' }, { status: 400 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    const updateData: any = {}

    if (username) {
      const existing = await prisma.user.findFirst({
        where: { 
          username,
          id: { not: user.id },
        },
      })

      if (existing) {
        return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
      }

      updateData.username = username
    }

    if (password) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Password lama wajib diisi' }, { status: 400 })
      }

      const { compare } = await import('bcryptjs')
      const isValid = await compare(currentPassword, currentUser.password)
      
      if (!isValid) {
        return NextResponse.json({ error: 'Password lama salah' }, { status: 400 })
      }

      updateData.password = await hash(password, 12)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'PROFILE_UPDATED',
        metadata: {
          updated: Object.keys(updateData),
        },
      },
    })

    logger.info('Profile updated', { userId: user.id, fields: Object.keys(updateData) })

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
    })
  } catch (error) {
    logger.error('Update profile failed', { error })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 })
  }
}
