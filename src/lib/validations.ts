import { z } from "zod"

export function sanitizeHtml(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

const sanitizedString = (min: number, max: number) => 
  z.string().min(min).max(max).transform(sanitizeHtml)

export const createBookSchema = z.object({
  title: sanitizedString(1, 255).refine(() => true, "Judul wajib diisi"),
  subtitle: z.string().max(255).transform(sanitizeHtml).optional(),
  synopsis: z.string().max(5000).transform(sanitizeHtml).optional(),
  genre: z.string().max(100).transform(sanitizeHtml).optional(),
  language: z.string().default("Indonesian"),
})

export type CreateBookInput = z.infer<typeof createBookSchema>

export const updateBookSchema = z.object({
  title: z.string().max(255).transform(sanitizeHtml).optional(),
  subtitle: z.string().max(255).transform(sanitizeHtml).optional(),
  synopsis: z.string().max(5000).transform(sanitizeHtml).optional(),
  genre: z.string().max(100).transform(sanitizeHtml).optional(),
  language: z.string().optional(),
  status: z.enum(['NOT_STARTED', 'CONCEPT', 'WRITING', 'WAITING_FOR_REVIEW', 'REVISION', 'VERIFIED', 'COMPLETED']).optional(),
  visibility: z.enum(['PRIVATE', 'SCHOOL', 'PUBLIC']).optional(),
})

export type UpdateBookInput = z.infer<typeof updateBookSchema>

export const uploadFileSchema = z.object({
  fileSize: z.number().max(50 * 1024 * 1024, "Ukuran file maksimal 50MB"),
  fileType: z.string().refine(
    (type) => type === 'application/pdf',
    "Format harus PDF"
  ),
})

export const createFeedbackSchema = z.object({
  bookVersionId: z.string().cuid(),
  pageNumber: z.number().int().min(1).optional(),
  comment: z.string().min(1, "Komentar wajib diisi").max(5000).transform(sanitizeHtml),
})

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>

export const loginSchema = z.object({
  identifier: z.string().min(1, "NISN atau Email wajib diisi").max(255),
  password: z.string().min(1, "Password wajib diisi").max(255),
})

export type LoginInput = z.infer<typeof loginSchema>

export const createUserSchema = z.object({
  name: sanitizedString(1, 255).refine(() => true, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid").max(255),
  password: z.string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter")
    .regex(/[A-Z]/, "Harus ada huruf besar")
    .regex(/[a-z]/, "Harus ada huruf kecil")
    .regex(/[0-9]/, "Harus ada angka"),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
  studentId: z.string().max(50).optional(),
  employeeId: z.string().max(50).optional(),
  classId: z.string().cuid().optional(),
  majorId: z.string().cuid().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
