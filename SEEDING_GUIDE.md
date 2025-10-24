# 🌱 Database Seeding Guide

## Quick Start - Seed via API

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Call Seed Endpoint
Open browser or use curl:

**Browser:**
```
http://localhost:3000/api/seed
```

**Or using curl:**
```bash
curl -X POST http://localhost:3000/api/seed
```

**Or using PowerShell:**
```powershell
Invoke-WebRequest -Uri http://localhost:3000/api/seed -Method POST
```

### Expected Response:
```json
{
  "success": true,
  "message": "Database seeded successfully",
  "counts": {
    "roles": 6,
    "businessUnits": 3,
    "users": 9
  }
}
```

---

## 📊 Seeded Data

### Roles (6)
| ID | Role Name | Description |
|----|-----------|-------------|
| 1 | Manager | Manager yang bertanggung jawab untuk strategi dan approval |
| 2 | Content Creator | Membuat konten visual dan video untuk social media |
| 3 | Social Media Manager | Mengelola akun social media dan engagement |
| 4 | Graphic Designer | Desain grafis untuk kampanye marketing |
| 5 | Video Editor | Edit video untuk konten TikTok, Reels, dan YouTube |
| 6 | Copywriter | Menulis caption dan copy untuk marketing |

### Business Units (3)
| Name | Description |
|------|-------------|
| DRW Estetika | Brand skincare DRW - Instagram & TikTok |
| DRW Clinic | Klinik kecantikan DRW |
| Marketing | Tim marketing general |

### Users (9)
| Name | Email | Role | Business Unit |
|------|-------|------|---------------|
| Budi Santoso | manager.drw@example.com | Manager | DRW Estetika |
| Siti Rahma | manager.clinic@example.com | Manager | DRW Clinic |
| Andi Wijaya | creator1@example.com | Content Creator | DRW Estetika |
| Dewi Lestari | creator2@example.com | Content Creator | DRW Estetika |
| Rini Puspita | socmed.instagram@example.com | Social Media Manager | DRW Estetika |
| Fajar Nugroho | socmed.tiktok@example.com | Social Media Manager | DRW Estetika |
| Linda Kartika | designer@example.com | Graphic Designer | Marketing |
| Eko Prasetyo | videoeditor@example.com | Video Editor | DRW Estetika |
| Maya Sari | copywriter@example.com | Copywriter | Marketing |

---

## ✅ Verify Seeding

### Check in Database:
```sql
-- Count records
SELECT 
  (SELECT COUNT(*) FROM roles) AS total_roles,
  (SELECT COUNT(*) FROM business_units) AS total_business_units,
  (SELECT COUNT(*) FROM users) AS total_users;

-- View all users with roles
SELECT 
  u.name,
  u.email,
  r.role_name,
  bu.name AS business_unit
FROM users u
LEFT JOIN roles r ON u.role_id = r.role_id
LEFT JOIN business_units bu ON u.business_unit_id = bu.bu_id
ORDER BY r.role_name, u.name;
```

### Check via API:
```bash
# Get all roles
curl http://localhost:3000/api/roles

# Get all users
curl http://localhost:3000/api/users

# Get all business units
curl http://localhost:3000/api/business-units
```

---

## 🔄 Re-seed Database

If you need to seed again (safe - uses UPSERT):
```bash
curl -X POST http://localhost:3000/api/seed
```

This will:
- ✅ Create records if they don't exist
- ✅ Skip if they already exist (no duplicates)
- ✅ Safe to run multiple times

---

## 🧪 Testing After Seeding

### Test Goal Creation:
1. Go to: `http://localhost:3000/dashboard/goals/create`
2. Fill form:
   - **Goal Name**: "Test Goal - 360M Impressions"
   - **Target Value**: "360.000.000"
   - **Business Unit**: Select "DRW Estetika"
   - **Role**: Select "Manager" (will use Budi Santoso)
   - **Dates**: Any range
3. Click "Simpan Semua Goal"
4. Should succeed with: ✅ "Goal berhasil dibuat!"

### Expected Flow:
1. Goal saved to database ✅
2. n8n webhook triggered ✅
3. AI analyzes and generates breakdown ✅
4. Dashboard shows "Awaiting Breakdown Approval" ✅

---

## 🚨 Troubleshooting

### Error: "No user found with the selected role"
**Solution**: Database not seeded yet. Run:
```bash
curl -X POST http://localhost:3000/api/seed
```

### Error: "Business unit not found"
**Solution**: Business units not seeded. Run seed endpoint above.

### Error: Database connection failed
**Solution**: Check `.env.local` file has correct `DATABASE_URL`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/hris_db"
```

---

## 📝 Alternative: SQL Seeding

If you prefer direct SQL:

1. **Connect to PostgreSQL:**
```bash
psql -d your_database_name -U your_username
```

2. **Run SQL file:**
```bash
\i prisma/seed.sql
```

Or in one command:
```bash
psql -d your_database_name -U your_username -f prisma/seed.sql
```

---

## ✨ Next Steps

After seeding:
1. ✅ Create a test goal
2. ✅ Configure n8n workflow (see `N8N_SETUP.md`)
3. ✅ Test complete AI workflow
4. ✅ Review AI-generated breakdowns in dashboard
