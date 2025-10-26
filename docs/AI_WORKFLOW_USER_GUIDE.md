# Quick Guide - AI Workflow Status Polling

## 🎯 Perubahan Terbaru

Polling untuk AI Workflow #2 (KPI Breakdown) telah diupdate:

| Aspek | Sebelum | Sekarang |
|-------|---------|----------|
| **Polling Interval** | 5 detik | **15 detik** |
| **Timeout** | 2 menit | **Tidak ada** |
| **Estimasi Waktu** | 30-60 detik | **3 menit - 1 jam** |
| **Flexibility** | Harus stay di page | **Bisa leave & return** |

## 📱 Cara Menggunakan

### Step 1: Trigger AI
1. Buka halaman Review: `/dashboard/review/[batch_id]`
2. **Save data dulu** (Team Roles + Breakdown)
3. Klik tombol: **🤖 Generate AI Recommendation**

### Step 2: Wait for Processing
Alert akan muncul:
```
🤖 AI sedang memproses rekomendasi KPI. 
Halaman akan otomatis check status setiap 15 detik.

⏱️ Estimasi waktu: 3 menit - 1 jam tergantung kompleksitas data.

Anda bisa meninggalkan halaman ini dan kembali lagi nanti.
```

### Step 3: Monitor Progress
Progress indicator akan muncul di semua 3 tabs:

```
🔄 Checking status... (1m 30s elapsed)

⏱️ Proses ini bisa memakan waktu 3 menit - 1 jam
💡 Anda bisa meninggalkan halaman ini dan kembali lagi nanti

Polling: 6 × 15s
1m 30s elapsed
```

### Step 4: Auto-Complete
Ketika AI selesai:
- ✅ Status otomatis berubah ke `KPI_Assignment_Pending`
- ✅ Data otomatis di-refresh
- ✅ Alert muncul: "Rekomendasi AI berhasil di-generate!"

## ⏱️ Timeline Examples

### Fast Processing (Small Data)
```
0:00 - Click "Generate AI"
0:15 - Check #1
0:30 - Check #2
0:45 - Check #3
1:00 - Check #4
2:30 - ✅ Complete! (after ~10 checks)
```

### Normal Processing (Medium Data)
```
0:00 - Click "Generate AI"
... checking every 15 seconds ...
15:00 - ✅ Complete! (after 60 checks)
```

### Long Processing (Large/Complex Data)
```
0:00 - Click "Generate AI"
... checking every 15 seconds ...
45:00 - ✅ Complete! (after 180 checks)
```

## 💡 Tips

### Do's ✅
- ✅ **Save data dulu** sebelum trigger AI
- ✅ Bisa **minimize browser** atau switch tab
- ✅ Bisa **kembali lagi nanti** untuk check hasil
- ✅ Monitor elapsed time di progress indicator

### Don'ts ❌
- ❌ Jangan **close browser tab** (polling akan stop)
- ❌ Jangan **click multiple times** (trigger duplicate)
- ❌ Jangan **refresh page** saat polling (akan reset)

## 🔍 Check Status Manually

Jika Anda leave page dan ingin check status manual:

### Option 1: Via Goals List
1. Go to `/dashboard/goals`
2. Lihat status badge batch Anda:
   - 🤖 **Analyzing** = Masih proses
   - 👀 **Review** = Sudah selesai!

### Option 2: Via Dashboard
1. Go to `/dashboard`
2. Check "Batches Pending Review" section
3. Jika batch muncul di sana = sudah selesai!

### Option 3: Direct URL
1. Buka lagi: `/dashboard/review/[batch_id]`
2. Data akan ter-load dengan hasil terbaru

## 🐛 Troubleshooting

### Problem: Polling tidak jalan
**Check:**
- Apakah tombol "Generate AI" di-click?
- Apakah ada error di browser console (F12)?
- Apakah internet connection stabil?

**Solution:**
- Refresh halaman
- Click "Generate AI" lagi

### Problem: Sudah 1 jam belum selesai
**Check:**
- Apakah n8n workflow running? (check n8n dashboard)
- Apakah ada error di n8n logs?

**Solution:**
- Check n8n execution logs
- Check database batch status: `SELECT * FROM analysis_batches WHERE batch_id = 'xxx'`
- Hubungi admin jika masih stuck

### Problem: Data tidak update setelah selesai
**Check:**
- Apakah status di database sudah `KPI_Assignment_Pending`?
- Apakah ada data di table `proposed_breakdowns`?

**Solution:**
- Refresh halaman manual
- Check database untuk verify data
- Check n8n webhook callback logs

## 📊 System Behavior

### Status Flow
```
User Click
   ↓
Analyzing (Backend set status)
   ↓
n8n Processing (3 min - 1 hour)
   ↓
KPI_Assignment_Pending (Webhook callback)
   ↓
Frontend Detect → Refresh Data → Show Alert
```

### Polling Behavior
- Starts when "Generate AI" clicked
- Checks every **15 seconds**
- Stops when status = `KPI_Assignment_Pending`
- Also stops if user navigates away

### What Gets Updated?
Ketika AI selesai, data ini yang di-update:
1. `ai_recommended_roles` - Team structure
2. `proposed_breakdowns` - KPI breakdown
3. `batch_managed_assets` - Managed assets
4. Batch status → `KPI_Assignment_Pending`

## 🎓 Understanding the Process

### What AI Does:
1. **Analyze** business unit data
2. **Recommend** team structure
3. **Break down** goals into KPIs
4. **Suggest** managed assets
5. **Calculate** target values

### Why It Takes Long:
- Large dataset processing
- Multiple AI model calls
- Complex calculations
- External API rate limits
- Queue waiting time

### Performance Factors:
- **Data Size**: More goals/units = longer
- **Complexity**: Complex goals = longer
- **n8n Load**: Server busy = longer
- **AI API**: OpenAI response time

## 📞 Support

Need help? Check these resources:
- `docs/POLLING_INTERVAL_UPDATE.md` - Technical details
- `docs/N8N_WEBHOOK_TROUBLESHOOTING.md` - Webhook issues
- `docs/AI_PROGRESS_POLLING_IMPLEMENTATION.md` - How polling works
- Contact: admin@yourcompany.com

---

**Last Updated**: October 26, 2025  
**Version**: 2.0 (15-second polling)
