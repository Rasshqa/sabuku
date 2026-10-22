# Setup Database Lokal - Quick Start

## Masalah
Supabase database tidak bisa diakses:
- Hostname tidak resolve: `db.doyxxdamtqrfzbqdyszg.supabase.co`
- Kemungkinan: project paused, dihapus, atau URL berubah

## Solusi: PostgreSQL Lokal dengan Docker

### 1. Start PostgreSQL via Docker

```bash
# Pull & run PostgreSQL
docker run -d \
  --name sabuku-postgres \
  -e POSTGRES_USER=sabuku \
  -e POSTGRES_PASSWORD=sabuku123 \
  -e POSTGRES_DB=sabuku_dev \
  -p 5432:5432 \
  postgres:15-alpine

# Verify running
docker ps | grep sabuku-postgres
```

### 2. Update .env

```bash
# Backup Supabase config
cp .env .env.supabase.backup

# Create new .env for local
cat > .env << 'EOF'
# Database (Local PostgreSQL)
DATABASE_URL="postgresql://sabuku:sabuku123@localhost:5432/sabuku_dev?schema=public"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="xHEIrcTpSHo9GrJeH1PfG0V+0GRwnEWiauB2VjOWOrM="

# Storage (Local)
STORAGE_PROVIDER="local"
LOCAL_STORAGE_DIR="./uploads"
EOF
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema (create tables)
npm run db:push

# Seed initial data
npm run db:seed
```

### 4. Run Application

```bash
npm run dev
```

Access: http://localhost:3000

---

## Alternatif: PostgreSQL Tanpa Docker

### Install PostgreSQL (Ubuntu/Debian)

```bash
# Install
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql << EOF
CREATE DATABASE sabuku_dev;
CREATE USER sabuku WITH PASSWORD 'sabuku123';
GRANT ALL PRIVILEGES ON DATABASE sabuku_dev TO sabuku;
\q
EOF
```

Lalu lanjut ke step 2-4 di atas.

---

## Docker Commands (Reference)

```bash
# Stop database
docker stop sabuku-postgres

# Start database
docker start sabuku-postgres

# Remove container
docker rm -f sabuku-postgres

# View logs
docker logs sabuku-postgres

# Connect via psql
docker exec -it sabuku-postgres psql -U sabuku -d sabuku_dev
```

---

## Test Connection

```bash
# Test with psql
psql "postgresql://sabuku:sabuku123@localhost:5432/sabuku_dev" -c "SELECT 1;"

# Or via Prisma
npx prisma db pull
```

---

## Default Accounts (After Seed)

```
Admin:   admin@smkn1cianjur.sch.id / admin123
Teacher: guru@smkn1cianjur.sch.id / teacher123
Student: siswa@smkn1cianjur.sch.id / student123
```

---

## Restore Supabase Later

When Supabase is back online:

```bash
# 1. Restore .env
cp .env.supabase.backup .env

# 2. Check connection
npx prisma db pull

# 3. Push schema
npx prisma db push

# 4. Seed if needed
npm run db:seed
```

---

## Quick Start (Copy-Paste)

```bash
# 1. Start Postgres
docker run -d --name sabuku-postgres \
  -e POSTGRES_USER=sabuku \
  -e POSTGRES_PASSWORD=sabuku123 \
  -e POSTGRES_DB=sabuku_dev \
  -p 5432:5432 postgres:15-alpine

# 2. Update .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://sabuku:sabuku123@localhost:5432/sabuku_dev?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="xHEIrcTpSHo9GrJeH1PfG0V+0GRwnEWiauB2VjOWOrM="
STORAGE_PROVIDER="local"
LOCAL_STORAGE_DIR="./uploads"
EOF

# 3. Setup DB
npm run db:generate
npm run db:push
npm run db:seed

# 4. Run
npm run dev
```

Open: http://localhost:3000
