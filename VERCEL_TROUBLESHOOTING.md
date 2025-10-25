# 🔧 Panduan Troubleshooting Deployment Vercel

## Status Saat Ini
Commit terakhir: `f8fd94a` - "Fix: Add explicit Prisma output path and Vercel build configuration"

## ✅ Perubahan yang Sudah Dilakukan

### 1. Prisma Schema Configuration
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
  output        = "../node_modules/.prisma/client"
}
```

**Penjelasan:**
- `native` - untuk development di Windows/Mac
- `rhel-openssl-3.0.x` - untuk Vercel (AWS Lambda runtime)
- `output` - lokasi eksplisit untuk Prisma Client

### 2. Package.json Scripts
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

**Penjelasan:**
- `build` - Generate Prisma sebelum build Next.js
- `postinstall` - Auto-generate setelah npm install di Vercel

### 3. Vercel Configuration (vercel.json)
```json
{
  "build": {
    "env": {
      "PRISMA_GENERATE_SKIP_POSTINSTALL": "false"
    }
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 📋 Checklist untuk Vercel Dashboard

### 1. Environment Variables
Pastikan variable berikut sudah di-set di Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL = postgresql://user:password@host:port/database?sslmode=require
```

**Format lengkap:**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslmode=require&pgbouncer=true
```

### 2. Build & Development Settings
- Framework Preset: **Next.js**
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

### 3. Function Settings
- Node.js Version: **20.x** (recommended)
- Region: Pilih region terdekat dengan database Anda

## 🧪 Testing Setelah Deploy

### 1. Tunggu Deploy Selesai
Cek di Vercel Dashboard → Deployments, tunggu hingga status menjadi "Ready"

### 2. Test Seed Endpoint
```bash
curl -X POST https://hrisnextgen.vercel.app/api/seed
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "data": {
    "roles": 5,
    "businessUnits": 3,
    "users": 10
  }
}
```

**Expected Response (Error):**
```json
{
  "success": false,
  "error": "Failed to seed database",
  "details": "..."
}
```

### 3. Test API Endpoints
```bash
# Test users endpoint
curl https://hrisnextgen.vercel.app/api/users

# Test business units endpoint
curl https://hrisnextgen.vercel.app/api/business-units

# Test goals endpoint
curl https://hrisnextgen.vercel.app/api/goals
```

## 🐛 Common Issues & Solutions

### Issue 1: "Query Engine not found"
**Symptom:**
```
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

**Solution:**
✅ Sudah diperbaiki dengan menambahkan `binaryTargets = ["native", "rhel-openssl-3.0.x"]`

### Issue 2: Database Connection Error
**Symptom:**
```
Can't reach database server at ...
```

**Solutions:**
1. Cek DATABASE_URL di Vercel environment variables
2. Pastikan database PostgreSQL accessible dari internet
3. Pastikan firewall/security group mengizinkan koneksi dari Vercel
4. Untuk Supabase/Neon/Railway: Gunakan connection pooler URL
5. Tambahkan `?sslmode=require` di akhir connection string

### Issue 3: Prisma Generate Failed
**Symptom:**
```
Error: Generator at prisma-client-js could not start
```

**Solutions:**
1. Clear Vercel build cache:
   - Vercel Dashboard → Project Settings → Clear Cache
   - Redeploy
2. Pastikan `postinstall` script ada di package.json
3. Cek Vercel build logs untuk error detail

### Issue 4: Timeout Errors
**Symptom:**
```
Function execution time exceeded
```

**Solution:**
✅ Sudah diperbaiki dengan `"maxDuration": 30` di vercel.json

## 🔍 Debug Steps

### 1. Check Vercel Build Logs
```
Vercel Dashboard → Deployments → [Latest] → Building
```

Look for:
- ✅ "Generating Prisma Client"
- ✅ "prisma:info Engine binary was located at ..."
- ❌ Any errors during prisma generate

### 2. Check Function Logs
```
Vercel Dashboard → Deployments → [Latest] → Functions
```

Look for:
- Database connection errors
- Prisma errors
- Runtime errors

### 3. Check Local Build
Test locally before deploying:
```bash
# Clean install
rm -rf node_modules .next
npm install

# Generate Prisma
npx prisma generate

# Build
npm run build

# Test locally
npm run dev
```

## 📞 Next Steps

1. **Tunggu 1-2 menit** untuk Vercel selesai deploy commit terbaru
2. **Check deployment status** di Vercel Dashboard
3. **Test seed endpoint**:
   ```bash
   curl -X POST https://hrisnextgen.vercel.app/api/seed
   ```
4. **Jika masih error**, screenshot error message dan check:
   - Vercel build logs
   - Vercel function logs
   - DATABASE_URL configuration

## 🎯 Expected Outcome

Setelah semua diperbaiki:
- ✅ Build succeeds di Vercel
- ✅ Prisma Client ter-generate dengan binary yang benar
- ✅ Database connection works
- ✅ Seed endpoint berhasil populate data
- ✅ Frontend dapat load users dan business units

---

**Last Updated:** ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
**Commit:** f8fd94a
