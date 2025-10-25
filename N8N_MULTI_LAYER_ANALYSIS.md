# N8N Multi-Layer AI Analysis Strategy

## 🎯 Problem
- Prompt terlalu panjang → timeout
- User butuh feedback cepat dulu, detail kemudian
- Output perlu bisa diedit user → convert jadi KPI

## ✅ Solution: 3-Layer Architecture

```
Layer 1: Quick Portfolio Health Check (15-30 detik)
   ↓
Layer 2: User Review & Edit (Manual approval di UI)
   ↓  
Layer 3: Generate KPIs dari rekomendasi yang di-approve (Auto)
```

---

## 🏗️ Architecture

### **Workflow 1: Quick Analysis** (Main)
**Webhook**: `/webhook/hrisnextgen-analyze`

**Nodes**:
1. Webhook - Terima data goals dari Next.js
2. AI Agent 1 - **Portfolio Health Check** (Simple & Fast)
3. Code - Parse response & format output
4. HTTP Request - POST ke `http://localhost:3000/api/webhooks/analysis-result`
5. Respond to Webhook - Return analysis_id ke Next.js

**AI Prompt 1** (Short & Fast - DYNAMIC):
```
Analisis cepat portfolio strategic goals berikut:

{{ $json.body.goals_summary.map((goal, index) => `Goal ${index + 1}: ${goal.goal_name} - ${goal.target_value.toLocaleString()} ${goal.target_unit}`).join('\n') }}

Jumlah Goals: {{ $json.body.goals_summary.length }}
Dibuat oleh: {{ $json.body.goals_summary[0].created_by }} ({{ $json.body.goals_summary[0].creator_role }})
Business Unit: {{ $json.body.goals_summary[0].business_unit }}
Timeline: {{ $json.body.goals_summary[0].start_date }} - {{ $json.body.goals_summary[0].end_date }}

Konteks singkat:
{{ $json.body.goals_summary.map((goal, i) => `- Goal ${i+1}: ${goal.goal_name} (Target: ${goal.target_value.toLocaleString()} ${goal.target_unit}, Timeline: ${goal.duration_months} bulan)`).join('\n') }}

Output JSON (Bahasa Indonesia):
{
  "skor_portfolio": 65,
  "status": "Perlu Perhatian",
  "ringkasan": "1-2 kalimat assessment cepat untuk SEMUA goals",
  "issue_utama": [
    "Issue 1 (mention specific goal name)",
    "Issue 2",
    "Issue 3"
  ],
  "rekomendasi_singkat": [
    "Rekomen 1 yang applicable untuk portfolio",
    "Rekomen 2"
  ],
  "perlu_deep_analysis": true
}

PENTING:
- Jika 1 goal: fokus pada feasibility & breakdown strategi
- Jika 2-3 goals: cek resource conflict & prioritas
- Jika 4+ goals: warning overload, suggest prioritization
- Sebutkan nama goal spesifik dalam issue/rekomendasi

Fokus pada: Resource allocation, Timeline realistis, Team capacity
```

**Output**:
```json
{
  "analysis_id": "ANALYSIS_1234567890",
  "skor_portfolio": 65,
  "status": "Perlu Perhatian",
  "quick_summary": "..."
}
```

---

### **Workflow 2: Deep Analysis** (On-demand)
**Webhook**: `/webhook/hrisnextgen-deep-analyze`
**Trigger**: User klik "Lihat Detail Analysis" di UI

**Nodes**:
1. Webhook - Terima `analysis_id` + `focus_area`
2. HTTP Request - Fetch goals data dari Next.js API
3. AI Agent 2 - **Deep Dive Analysis** (fokus 1 area)
4. Code - Parse & format
5. HTTP Request - Update `analysis_results` table
6. Respond to Webhook

**AI Prompt 2** (Focused):
```
Deep dive analysis untuk area: {{ $json.body.focus_area }}

Goals context: {{ $json.goals_data }}

Berikan analysis detail dalam format JSON:
{
  "area": "{{ $json.body.focus_area }}",
  "assessment": "...",
  "breakdown": {
    "temuan": ["..."],
    "impact": ["..."],
    "solusi": ["..."]
  },
  "kpi_suggestions": [
    {
      "kpi_name": "Nama KPI",
      "target_value": 100000,
      "target_unit": "Impressions",
      "platform": "Instagram",
      "assigned_role": "Content Creator",
      "rationale": "Kenapa KPI ini penting"
    }
  ]
}
```

---

### **Workflow 3: KPI Generator** (Final)
**Webhook**: `/webhook/hrisnextgen-generate-kpis`
**Trigger**: User approve recommendations di UI

**Nodes**:
1. Webhook - Terima approved recommendations
2. AI Agent 3 - **Convert to KPIs**
3. Code - Validate KPI structure
4. HTTP Request - Insert to `proposed_kpis` table
5. Respond to Webhook

**AI Prompt 3** (KPI Generator):
```
Convert recommendations menjadi KPIs yang actionable:

Approved Recommendations: {{ $json.approved_items }}
Goal Context: {{ $json.goal_data }}

Generate KPIs dengan struktur:
{
  "kpis": [
    {
      "kpi_description": "Generate 30M organic impressions per month on Instagram",
      "target_bulanan": 30000000,
      "platform": "Instagram",
      "source": "Organik",
      "suggested_role_id": 1,
      "rationale": "Based on 360M yearly target divided by 12 months"
    }
  ]
}

Aturan:
- Target bulanan = yearly target / 12
- 1 recommendation = 1-3 KPIs
- Spesifik platform dan source
- Realistic untuk role yang ada
```

---

## 📊 Database Schema

### Table: `analysis_results`
```sql
CREATE TABLE analysis_results (
  analysis_id VARCHAR(50) PRIMARY KEY,
  analyzed_at TIMESTAMP DEFAULT NOW(),
  goals_analyzed INT,
  skor_portfolio INT,
  status VARCHAR(50),
  quick_summary TEXT,
  full_analysis JSONB,
  approved_recommendations JSONB,
  status_workflow VARCHAR(50) DEFAULT 'quick_done', -- quick_done, deep_pending, deep_done, kpi_generated
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 UI Flow

### **Step 1: Dashboard `/dashboard/goals`**
```
┌─────────────────────────────────┐
│  📊 Goal Management             │
├─────────────────────────────────┤
│                                 │
│  ┌──────────────────────────┐  │
│  │ Goal 1: 360M Impressi    │  │
│  │ Goal 2: 1M Follower      │  │
│  └──────────────────────────┘  │
│                                 │
│  [🤖 Analisa Portfolio]         │
│       ↓ Click                   │
│  Loading... 15 detik            │
└─────────────────────────────────┘
```

### **Step 2: Quick Analysis Result (Modal)**
```
┌─────────────────────────────────────────┐
│  🤖 Hasil Analisis Portfolio            │
├─────────────────────────────────────────┤
│                                         │
│  Skor Portfolio: 65/100 ⚠️              │
│  Status: Perlu Perhatian                │
│                                         │
│  Ringkasan:                             │
│  Portfolio memiliki 2 goals ambisius    │
│  dengan resource terbatas (1 orang)     │
│                                         │
│  ⚠️ Issue Utama:                        │
│  • Resource overload (1 Content Creator)│
│  • Timeline terlalu agresif             │
│  • Missing revenue/engagement goals     │
│                                         │
│  💡 Rekomendasi Singkat:                │
│  • Hire 2-3 additional Content Creators │
│  • Phase goals: Q1-Q2 focus Impressions │
│                                         │
│  [📋 Lihat Detail & Edit] [❌ Cancel]   │
└─────────────────────────────────────────┘
```

### **Step 3: Detail Analysis & Edit Page**
```
/dashboard/analysis/[analysis_id]

┌─────────────────────────────────────────────┐
│  📊 Portfolio Analysis Detail               │
│  Analysis ID: ANALYSIS_1234567890           │
├─────────────────────────────────────────────┤
│                                             │
│  Skor: 65  [●●●●●●●○○○] Perlu Perhatian    │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  📍 1. Resource Allocation                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                             │
│  Status: ⚠️ Overload                        │
│                                             │
│  Temuan:                                    │
│  ☑ 1 Content Creator tidak cukup           │
│  ☑ Butuh 40-50 jam/minggu untuk 2 goals    │
│  ☑ Estimasi konten: 20-25 posts/minggu     │
│                                             │
│  Rekomendasi AI:                            │
│  ┌─────────────────────────────────────┐   │
│  │ ✏️ Hire 2 Content Creator           │   │
│  │    Budget: Rp 20-30 juta/bulan      │   │
│  │    Timeline: Dalam 30 hari          │   │
│  │                                      │   │
│  │    [✓ Approve] [✎ Edit] [✗ Reject] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ✏️ Allocate budget Rp 30M/month     │   │
│  │    untuk paid ads                    │   │
│  │                                      │   │
│  │    [✓ Approve] [✎ Edit] [✗ Reject] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [💾 Generate KPIs dari Approved Items]    │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  📍 2. Priority & Timeline                  │
│  [🔍 Load Deep Analysis]                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                             │
│  ... (6 sections total)                     │
└─────────────────────────────────────────────┘
```

### **Step 4: Generate KPIs**
After user approve recommendations:
```
┌─────────────────────────────────────────┐
│  🎯 Generating KPIs...                  │
├─────────────────────────────────────────┤
│                                         │
│  ✅ 3 recommendations approved          │
│  🤖 Converting to KPIs...               │
│                                         │
│  Generated:                             │
│  ✓ KPI 1: 30M monthly Instagram impressions│
│  ✓ KPI 2: Hire 2 Content Creators      │
│  ✓ KPI 3: Setup paid ads budget        │
│                                         │
│  [✅ Save to KPI Management]            │
└─────────────────────────────────────────┘
```

---

## 🚀 Implementation Steps

### Phase 1: Quick Analysis (Sekarang)
1. ✅ Shorten AI prompt (sudah ada di atas)
2. Create `analysis_results` table
3. Create API `/api/analysis/save`
4. Update UI to show quick results in modal
5. Test workflow

### Phase 2: Detail Analysis (Next)
1. Create detail analysis page
2. Build edit interface for recommendations
3. Create deep analysis workflow (on-demand per section)
4. Save approved items

### Phase 3: KPI Generator (Final)
1. Create KPI generator workflow
2. Auto-insert to `proposed_kpis`
3. Link to existing KPI Approval page

---

Mau saya mulai implement Phase 1 (Quick Analysis) dulu? Atau langsung full implementation?

