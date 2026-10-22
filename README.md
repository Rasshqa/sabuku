# SABUKU - Satu Orang Satu Buku

**Platform Literasi Digital SMKN 1 Cianjur**

Complete digital literacy management system with real PDF processing, A5 validation, version control, and authenticated book reading.

---

## ✨ Architecture Overview

This is a **clean, production-ready rebuild** following strict technical requirements:

### Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + React 19
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Database**: PostgreSQL + Prisma ORM 5
- **Auth**: NextAuth.js 4 (credentials-based, role-based access control)
- **PDF Processing**: pdf-lib (real page counting + A5 dimension validation)
- **Storage**: Abstracted (local dev, S3/Supabase for prod)
- **Security**: bcrypt password hashing, signed URLs, permission checks

### Key Features

✅ **Real PDF Processing**
- Actual page counting using pdf-lib
- A5 dimension validation (148×210mm with 3% tolerance)
- Separate counts: totalPageCount, a5PageCount, nonA5PageCount
- Target logic: `a5PageCount >= 60` (no maximum)

✅ **Proper Architecture**
- Business logic in `src/server/services/`
- Database operations separated from UI
- Permission checks on every protected route
- Zod validation on all inputs
- Database transactions for multi-step operations

✅ **Security First**
- Role-based access (ADMIN, TEACHER, STUDENT)
- Ownership verification
- Private file protection (signed URLs ready)
- Password hashing with bcrypt
- Input validation server-side

✅ **Scalable Design**
- Multiple books per user (1:N relation)
- Unlimited versions per book
- PostgreSQL with proper indexing
- Separated storage layer
- Background processing architecture ready

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

```bash
cd /home/rasshqa/sabuku

# Install dependencies
npm install

# Configure database
# Edit .env with your PostgreSQL credentials
cp .env.example .env

# Run migrations
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

Access at `http://localhost:3000`

---

## 🔐 Default Accounts

```
Admin:   admin@smkn1cianjur.sch.id / admin123
Teacher: guru@smkn1cianjur.sch.id / teacher123
Student: siswa@smkn1cianjur.sch.id / student123
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Protected routes with layout
│   │   ├── dashboard/        # Main dashboard (role-based)
│   │   ├── books/            # Book management
│   │   │   ├── new/          # Create book
│   │   │   └── [id]/
│   │   │       ├── page.tsx  # Book detail
│   │   │       ├── upload/   # Upload manuscript
│   │   │       └── reader/   # Book reader (landscape mode)
│   │   └── library/          # Public library
│   │
│   ├── api/
│   │   ├── auth/             # NextAuth
│   │   └── books/            # Book API
│   │       ├── route.ts      # GET/POST books
│   │       └── [id]/upload/  # File upload with processing
│   │
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
│
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── books/                # Book-specific components
│   ├── reader/               # PDF reader components
│   ├── dashboard/            # Dashboard components
│   └── providers.tsx         # NextAuth provider
│
├── lib/
│   ├── auth.ts               # Password hashing
│   ├── auth-options.ts       # NextAuth config
│   ├── prisma.ts             # Prisma client
│   ├── permissions.ts        # Access control
│   ├── validations.ts        # Zod schemas
│   ├── storage.ts            # Storage abstraction
│   ├── pdf.ts                # PDF processing (pdf-lib)
│   └── utils.ts              # Utilities
│
├── server/
│   └── services/
│       ├── book.service.ts   # Book business logic
│       └── version.service.ts # Version management
│
├── types/
│   └── next-auth.d.ts        # Type extensions
│
└── prisma/
    ├── schema.prisma         # Database schema
    └── seed.ts               # Seed data
```

---

## 🗄️ Database Schema

### Key Models

**User** (ADMIN | TEACHER | STUDENT)
- Authentication & profile
- Role-based permissions
- Class & Major associations

**Book**
- 1:N with User (multiple books per user)
- Status tracking (NOT_STARTED → COMPLETED)
- Visibility (PRIVATE | SCHOOL | PUBLIC)
- `a5PageCount` (actual A5 page count from processing)
- `targetPages` default 60, no maximum

**BookVersion**
- Unlimited versions per book
- `totalPageCount`, `a5PageCount`, `nonA5PageCount`
- Processing status tracking
- File URLs (original + processed PDF)
- One version marked `isCurrent`

**Feedback** → linked to BookVersion
**Milestone** → 10 default per book
**Activity** → audit trail
**Mentorship** → teacher assignments

### Relations

```
User 1 ──── N Book
Book 1 ──── N BookVersion
BookVersion 1 ──── N Feedback
Book 1 ──── N Milestone
Book 1 ──── N Activity
```

---

## 🔧 Environment Variables

Create `.env` (see `.env.example`):

```env
# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_here"

# Storage (local for dev, S3/Supabase for prod)
STORAGE_PROVIDER="local"
STORAGE_BUCKET="sabuku-files"
STORAGE_ENDPOINT=""
STORAGE_ACCESS_KEY_ID=""
STORAGE_SECRET_ACCESS_KEY=""
```

---

## 📄 PDF Processing

### How It Works

1. **Upload**: User uploads PDF/DOC/DOCX (up to 50MB)
2. **Validation**: File type, size, ownership checks
3. **Processing**:
   - PDF: Direct processing with pdf-lib
   - DOC/DOCX: TODO - Convert to PDF first (placeholder)
4. **Page Counting**:
   ```typescript
   const pdf = await PDFDocument.load(buffer)
   for (const page of pdf.getPages()) {
     const { width, height } = page.getSize()
     if (isA5(width, height)) a5PageCount++
   }
   ```
5. **A5 Validation**:
   - A5 portrait: 419.53 × 595.28 points
   - A5 landscape: 595.28 × 419.53 points
   - Tolerance: ±3% for conversion variance
6. **Update**: Book record updated with accurate counts
7. **Activity Log**: Version upload logged

### Result

```json
{
  "totalPageCount": 72,
  "a5PageCount": 70,
  "nonA5PageCount": 2
}
```

Target check: `a5PageCount >= 60` ✓

---

## 🔒 Security

### Authentication Flow

```
Login → Credentials → NextAuth → Verify (Prisma + bcrypt)
→ Generate JWT → Session → Protected Routes
```

### Authorization Levels

**Public**: Landing, login
**Authenticated**: Dashboard, library, own books
**Owner**: Edit/upload own books
**Teacher**: View assigned books, give feedback
**Admin**: Full access

### Permission Checks

Every sensitive operation:
```typescript
const user = await requireAuth()
const canEdit = await canEditBook(bookId, user.id, user.role)
if (!canEdit) throw new Error("Forbidden")
```

### File Security

- Private files not publicly accessible
- Signed URL generation ready
- Local dev: served via authenticated API route
- Production: S3 presigned URLs

---

## 🎯 Business Rules (Critical)

1. **Target: 60 A5 pages minimum, NO MAXIMUM**
   ```typescript
   const meetsTarget = a5PageCount >= 60  // not === 60
   ```

2. **Multiple books per user**
   - One user can create unlimited books
   - Each book independent

3. **Versioning**
   - Every upload creates new version
   - Old versions preserved (audit trail)
   - Only one marked `isCurrent`

4. **Status Flow**
   ```
   NOT_STARTED → CONCEPT → WRITING → WAITING_FOR_REVIEW
   → REVISION → VERIFIED → COMPLETED
   ```

5. **Visibility**
   - PRIVATE: owner + assigned teacher + admin
   - SCHOOL: all authenticated users
   - PUBLIC: everyone

6. **Book Reader**
   - Mobile: landscape orientation required
   - Desktop: two-page spread
   - TODO: Integrate PDF.js for actual rendering

---

## 📊 Statistics

All dashboard stats come from **real database queries**:

```typescript
const targetReached = await prisma.book.count({
  where: { a5PageCount: { gte: 60 } }
})
```

No fake data. No hardcoded numbers.

---

## 🚧 TODO / Production Checklist

### High Priority

- [ ] **DOC/DOCX to PDF conversion** (LibreOffice headless / service)
- [ ] **PDF.js integration** in Book Reader (actual PDF rendering)
- [ ] **S3/Supabase Storage** (replace local storage)
- [ ] **Background processing** for heavy PDF operations
- [ ] **Feedback CRUD UI** (data structure ready)
- [ ] **Admin panel** (users, books, classes management)

### Medium Priority

- [ ] Search & filters
- [ ] Notifications
- [ ] Email integration
- [ ] User profile editing
- [ ] Cover image upload
- [ ] Export stats (CSV/PDF)

### Infrastructure

- [ ] Production DB migration
- [ ] CDN for static assets
- [ ] Redis caching layer
- [ ] Monitoring (Sentry)
- [ ] CI/CD pipeline
- [ ] Automated backups

---

## 🧪 Testing

### Manual Test Flow

1. **Login** as student
2. **Create book** with title, genre
3. **Upload PDF** (any PDF for testing)
4. **Verify**: System counts pages, validates A5
5. **Check dashboard**: Progress updated
6. **Upload again**: New version created
7. **View book detail**: See versions, milestones
8. **Open reader**: Landscape check works
9. **Login as admin**: See all books

### Test with Real PDF

To test A5 validation, use actual A5 PDF:
- 60+ pages = ✓ Target met
- Mixed sizes = Separate A5/non-A5 counts
- < 60 pages = Warning shown

---

## 🔄 Deployment

### Recommended Stack

**App + API**: Vercel
**Database**: Supabase PostgreSQL / AWS RDS
**Storage**: Supabase Storage / AWS S3
**Processing**: Separate worker (Docker container with LibreOffice)

### Steps

1. Push to Vercel
2. Connect PostgreSQL
3. Set environment variables
4. Run migrations: `npx prisma migrate deploy`
5. Seed: `npm run db:seed`
6. Configure storage credentials
7. Set up processing worker (if needed)

---

## 📝 API Routes

### Authentication

- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Books

- `POST /api/books` - Create book
- `GET /api/books` - Get user's books
- `POST /api/books/[id]/upload` - Upload version

### Planned

- `PATCH /api/books/[id]` - Update book
- `POST /api/books/[id]/feedback` - Add feedback
- `GET /api/admin/users` - List users
- `GET /api/admin/statistics` - Stats

---

## 🎓 Development Principles

### What This Build Does Right

✅ Real PDF processing (not estimation)
✅ Proper separation of concerns
✅ Business logic outside components
✅ Server-side validation
✅ Type safety (TypeScript + Prisma + Zod)
✅ Permission checks everywhere
✅ Database transactions
✅ Audit logging
✅ Scalable architecture

### What Was Avoided

❌ No fake statistics
❌ No client-side-only validation
❌ No hardcoded permissions
❌ No SQL in components
❌ No single-book-per-user design
❌ No unlimited file uploads without validation

---

## 📚 Key Files

**Core Logic**:
- `src/lib/pdf.ts` - PDF processing with pdf-lib
- `src/server/services/book.service.ts` - Book operations
- `src/server/services/version.service.ts` - Version + processing
- `src/lib/permissions.ts` - Access control

**Important Pages**:
- `src/app/(dashboard)/dashboard/page.tsx` - Role-based dashboard
- `src/app/(dashboard)/books/[id]/page.tsx` - Book detail
- `src/app/api/books/[id]/upload/route.ts` - Upload + processing

---

## 🤝 Support

**For Developers**: See inline code comments, TypeScript types
**For School IT**: Contact project maintainer
**For Users**: Help text in forms, error messages in Indonesian

---

## 📄 License

Internal use - SMKN 1 Cianjur

---

**Built with proper software engineering principles.**  
**Ready for production deployment after completing TODO items.**

Selamat menggunakan SABUKU! 📚
