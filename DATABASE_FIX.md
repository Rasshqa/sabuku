# Database Connection Failed

## Masalah

Database Supabase tidak bisa diakses:
```
db.doyxxdamtqrfzbqdyszg.supabase.co:5432
```

## Solusi

### Opsi 1: Cek Koneksi Supabase

1. **Cek status Supabase**
   - Buka https://supabase.com/dashboard
   - Pastikan project aktif
   - Cek apakah database paused (auto-pause setelah 7 hari tidak aktif di free tier)

2. **Unpause database** (jika paused)
   - Masuk ke Supabase dashboard
   - Pilih project `doyxxdamtqrfzbqdyszg`
   - Klik "Restore" atau "Resume" jika database paused

3. **Cek koneksi**
```bash
# Test koneksi
psql "postgresql://postgres:rashqaandreanfitrahsulaeman@db.doyxxdamtqrfzbqdyszg.supabase.co:5432/postgres"
```

### Opsi 2: Migration Manual via SQL Editor

Jika database online tapi `prisma db push` gagal, run migration manual:

1. Buka **Supabase Dashboard → SQL Editor**

2. Run query ini:
```sql
-- Add username column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Add unique constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_username_key'
  ) THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE("username");
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");
CREATE INDEX IF NOT EXISTS "User_studentId_idx" ON "User"("studentId");

-- Verify
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User' 
  AND column_name = 'username';
```

3. Verify:
```sql
SELECT COUNT(*) FROM "User";
```

### Opsi 3: Setup Database Lokal (Development)

Untuk development tanpa koneksi internet:

1. **Install PostgreSQL lokal**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
```

2. **Buat database lokal**
```bash
sudo -u postgres psql
CREATE DATABASE sabuku_dev;
CREATE USER sabuku WITH PASSWORD 'sabuku123';
GRANT ALL PRIVILEGES ON DATABASE sabuku_dev TO sabuku;
\q
```

3. **Update .env**
```bash
# Backup current
cp .env .env.supabase

# Use local DB
cat > .env << 'EOF'
DATABASE_URL="postgresql://sabuku:sabuku123@localhost:5432/sabuku_dev?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="xHEIrcTpSHo9GrJeH1PfG0V+0GRwnEWiauB2VjOWOrM="
STORAGE_PROVIDER="local"
LOCAL_STORAGE_DIR="./uploads"
EOF
```

4. **Run migration**
```bash
npx prisma db push
npx prisma generate
npm run db:seed
```

### Opsi 4: Ganti Database URL

Jika password salah atau URL berubah:

1. **Dapatkan connection string baru**
   - Supabase Dashboard → Settings → Database
   - Copy "Connection string" (URI format)

2. **Update .env**
```bash
DATABASE_URL="postgresql://postgres.doyxxdamtqrfzbqdyszg:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

3. **Test connection**
```bash
npx prisma db pull
```

## Cek Database Status

```bash
# 1. Cek network
ping db.doyxxdamtqrfzbqdyszg.supabase.co

# 2. Cek port
nc -zv db.doyxxdamtqrfzbqdyszg.supabase.co 5432

# 3. Test dengan psql
psql "postgresql://postgres:PASSWORD@db.doyxxdamtqrfzbqdyszg.supabase.co:5432/postgres" -c "SELECT 1;"
```

## Setelah Database Online

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Push schema
npx prisma db push

# 3. Seed data
npm run db:seed

# 4. Build
npm run build

# 5. Run dev
npm run dev
```

## Migration SQL (Copy-Paste Ready)

Jika pakai SQL editor atau psql langsung:

```sql
-- Migration: Add username field
-- Date: 2026-09-30

BEGIN;

-- Add username column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Add unique constraint
ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE("username");

-- Add indexes
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE INDEX "User_studentId_idx" ON "User"("studentId");

COMMIT;

-- Verify migration
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'User' 
ORDER BY ordinal_position;
```

## Troubleshooting

**Error: "relation 'User' does not exist"**
- Database belum di-setup
- Run: `npx prisma db push` untuk create semua tables

**Error: "password authentication failed"**
- Password salah di .env
- Dapatkan password baru dari Supabase dashboard

**Error: "connection timeout"**
- Database paused atau internet issue
- Unpause di Supabase dashboard atau cek koneksi

**Error: "SSL connection required"**
- Tambah `?sslmode=require` di DATABASE_URL

---

**Rekomendasi**: Pakai database lokal untuk development, Supabase untuk production.
