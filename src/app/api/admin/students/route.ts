import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const createStudentSchema = z.object({
  nisn: z.string().length(10, "NISN harus 10 digit"),
  name: z.string().min(1).max(255),
  classId: z.string().cuid().optional(),
  majorId: z.string().cuid().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { nisn, name, classId, majorId } = createStudentSchema.parse(body)

    const existing = await prisma.user.findFirst({
      where: { studentId: nisn },
    })

    if (existing) {
      return NextResponse.json({ error: 'NISN sudah terdaftar' }, { status: 400 })
    }

    const hashedPassword = await hash(nisn, 12)

    const student = await prisma.user.create({
      data: {
        name,
        email: `${nisn}@student.smkn1cianjur.sch.id`,
        password: hashedPassword,
        role: 'STUDENT',
        studentId: nisn,
        classId,
        majorId,
      },
    })

    logger.info('Student created', { studentId: student.id, nisn })

    return NextResponse.json({
      success: true,
      message: 'Siswa berhasil didaftarkan',
      nisn,
    }, { status: 201 })
  } catch (error) {
    logger.error('Create student failed', { error })
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Gagal mendaftarkan siswa' }, { status: 500 })
  }
}
