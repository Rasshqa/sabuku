# Sistem Login SABUKU

## Fitur Baru ✅

### 1. Landing Page
**URL**: `/`

Tampilan landing dengan 2 pilihan:
- **Login Siswa** (biru) → `/login/siswa`
- **Login Guru** (hijau) → `/login/guru`

### 2. Login Siswa
**URL**: `/login/siswa`

Input:
- NISN atau Username
- Password

Login pertama:
- NISN sebagai username
- NISN sebagai password (default)

Setelah setup:
- NISN atau username custom
- Password custom

### 3. Login Guru  
**URL**: `/login/guru`

Input:
- Email sekolah
- Password

### 4. Profile Management
**URL**: `/profile` (authenticated)

Fitur:
- Tambah/ubah username (min 3 karakter, alphanumeric + underscore)
- Ubah password (min 8 karakter)

### 5. Student Registration API
**URL**: `POST /api/admin/students`

Body:
```json
{
  "nisn": "1234567890",
  "name": "Nama Siswa",
  "classId": "optional",
  "majorId": "optional"
}
```

Response:
- Auto-generate email: `{nisn}@student.smkn1cianjur.sch.id`
- Default password: NISN
- Role: STUDENT

## Flow Lengkap

### Siswa Baru
1. Admin daftar siswa via API: `POST /api/admin/students`
2. Siswa login pertama kali: NISN/NISN
3. Siswa ke `/profile` → tambah username + ubah password
4. Login selanjutnya: username/password baru

### Guru
1. Admin buat akun manual (seed/database)
2. Guru login: email/password
3. Guru bisa ubah password di `/profile`

## Database Schema

Tambahan field di User:
```prisma
username  String?  @unique
```

Index:
- `username`
- `studentId`

## Migration Required

Sebelum deploy, jalankan:
```bash
npx prisma db push
```

Atau manual SQL:
```sql
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE("username");
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE INDEX "User_studentId_idx" ON "User"("studentId");
```

## Auth Logic Update

Login sekarang cek 4 field:
1. email
2. studentId (NISN)
3. username
4. employeeId

File: `src/lib/auth-options.ts`

## API Endpoints

```
GET  /                          # Landing page
GET  /login/siswa              # Student login page
GET  /login/guru               # Teacher login page
GET  /profile                  # Profile management
POST /api/admin/students       # Register student
PATCH /api/profile             # Update username/password
```

## Testing

Setelah migration:

1. Buat siswa:
```bash
curl -X POST http://localhost:3000/api/admin/students \
  -H "Content-Type: application/json" \
  -d '{"nisn":"1234567890","name":"Test Siswa"}'
```

2. Login siswa: `/login/siswa`
   - NISN: `1234567890`
   - Password: `1234567890`

3. Tambah username: `/profile`

4. Login lagi dengan username baru

## Security

- Password hashed dengan bcrypt (cost 12)
- Username validation: alphanumeric + underscore, min 3 char
- Unique constraint pada username
- Current password required untuk ubah password
- Rate limiting pada login

