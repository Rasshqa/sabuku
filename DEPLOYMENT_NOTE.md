# Deployment Note - Schema Update Required

## Database Migration Needed

Before deploying, run this migration:

```sql
-- Add username column to User table
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE("username");
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE INDEX "User_studentId_idx" ON "User"("studentId");
```

Or use Prisma:

```bash
npx prisma db push
# or
npx prisma migrate dev --name add_username
```

## New Features

1. **Separate Login Pages**
   - `/login/siswa` - Login with NISN or username
   - `/login/guru` - Login with email
   - `/` - Landing page with role selector

2. **Student Registration API**
   - `POST /api/admin/students`
   - Creates student with NISN as default password
   - Auto-generates email: `{nisn}@student.smkn1cianjur.sch.id`

3. **Profile Management**
   - `/profile` - Add/change username and password
   - Students can set custom username
   - Students can change from default NISN password

## Login Flow

**Student (First Time)**:
1. Admin registers student with NISN
2. Default password = NISN
3. Student logs in with NISN
4. Student can add username + change password

**Student (After Setup)**:
- Login with NISN or username
- Uses custom password

**Teacher**:
- Login with email only
- Admin-provided password

## API Endpoints

```
POST /api/admin/students        # Register student (admin only)
PATCH /api/profile              # Update username/password (authenticated)
GET /api/health                 # Health check
```

## Environment

No changes to env vars needed. Existing setup works.

## Testing After Deploy

1. Check landing page: `/`
2. Test student login: `/login/siswa`
3. Test teacher login: `/login/guru`
4. Verify profile update: `/profile`
5. Health check: `/api/health`

