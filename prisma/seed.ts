import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const hashedPassword = await bcrypt.hash('admin123', 10)
  const teacherPassword = await bcrypt.hash('teacher123', 10)
  const studentPassword = await bcrypt.hash('student123', 10)

  // Create admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smkn1cianjur.sch.id' },
    update: {},
    create: {
      email: 'admin@smkn1cianjur.sch.id',
      name: 'Admin SABUKU',
      password: hashedPassword,
      role: 'ADMIN',
      employeeId: 'ADM001',
    },
  })

  // Create teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'guru@smkn1cianjur.sch.id' },
    update: {},
    create: {
      email: 'guru@smkn1cianjur.sch.id',
      name: 'Budi Santoso',
      password: teacherPassword,
      role: 'TEACHER',
      employeeId: 'GR001',
    },
  })

  // Create student
  const student = await prisma.user.upsert({
    where: { email: 'siswa@smkn1cianjur.sch.id' },
    update: {},
    create: {
      email: 'siswa@smkn1cianjur.sch.id',
      name: 'Andi Wijaya',
      password: studentPassword,
      role: 'STUDENT',
      studentId: '12345',
    },
  })

  console.log('✅ Seeding completed')
  console.log('\nDefault accounts:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin:   admin@smkn1cianjur.sch.id / admin123')
  console.log('Teacher: guru@smkn1cianjur.sch.id / teacher123')
  console.log('Student: siswa@smkn1cianjur.sch.id / student123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return { admin, teacher, student }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
