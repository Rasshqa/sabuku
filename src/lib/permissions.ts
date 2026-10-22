import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  
  return prisma.user.findUnique({
    where: { id: session.user.id },
  })
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden")
  }
  return user
}

export async function canAccessBook(bookId: string, userId: string, userRole: string): Promise<boolean> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { ownerId: true, visibility: true },
  })

  if (!book) return false

  // Owner always has access
  if (book.ownerId === userId) return true

  // Admin always has access
  if (userRole === 'ADMIN') return true

  // Teachers have access to non-private books
  if (userRole === 'TEACHER' && book.visibility !== 'PRIVATE') return true

  // Check mentorship
  const mentorship = await prisma.mentorship.findFirst({
    where: {
      bookId,
      teacherId: userId,
      status: 'active',
    },
  })
  if (mentorship) return true

  // Public books accessible to all authenticated users
  if (book.visibility === 'PUBLIC') return true

  // School visibility requires same class or major
  if (book.visibility === 'SCHOOL') {
    const bookOwner = await prisma.user.findUnique({
      where: { id: book.ownerId },
      select: { classId: true, majorId: true }
    })
    const requestor = await prisma.user.findUnique({
      where: { id: userId },
      select: { classId: true, majorId: true }
    })
    return Boolean(
      (bookOwner?.classId && bookOwner.classId === requestor?.classId) || 
      (bookOwner?.majorId && bookOwner.majorId === requestor?.majorId)
    )
  }

  return false
}

export async function canEditBook(bookId: string, userId: string, userRole: string): Promise<boolean> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { ownerId: true },
  })

  if (!book) return false

  // Only owner or admin can edit
  return book.ownerId === userId || userRole === 'ADMIN'
}

export const canViewBook = canAccessBook
