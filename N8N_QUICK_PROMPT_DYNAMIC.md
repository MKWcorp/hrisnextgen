# N8N Quick Analysis Prompt (DYNAMIC VERSION)

## 🎯 Untuk n8n AI Agent Node

**Karakteristik**:
- ✅ Dinamis: Handle 1-N goals
- ✅ Fast: 15-30 detik runtime
- ✅ Output: JSON terstruktur
- ✅ Bahasa Indonesia

---

## 📝 Prompt untuk AI Agent Node

```
Kamu adalah Strategic Portfolio Analyst untuk HRIS system.

Analisis cepat portfolio strategic goals berikut:

GOALS YANG AKAN DIANALISIS:
{{ $json.body.goals_summary.map((goal, index) => `Goal ${index + 1}: ${goal.goal_name} - ${goal.target_value.toLocaleString()} ${goal.target_unit}`).join('\n') }}

CONTEXT:
- Jumlah Goals: {{ $json.body.goals_summary.length }}
- Business Unit: {{ $json.body.goals_summary[0].business_unit }}
- Dibuat oleh: {{ $json.body.goals_summary[0].created_by }} ({{ $json.body.goals_summary[0].creator_role }})
- Timeline Range: {{ $json.body.goals_summary[0].start_date }} s/d {{ $json.body.goals_summary[0].end_date }}

DETAIL GOALS:
{{ $json.body.goals_summary.map((goal, i) => `
Goal ${i+1}: ${goal.goal_name}
- Target: ${goal.target_value.toLocaleString()} ${goal.target_unit}
- Durasi: ${goal.duration_months} bulan
- Timeline: ${goal.start_date} - ${goal.end_date}
`).join('\n') }}

TUGAS:
Berikan analisis cepat dalam format JSON berikut:

{
  "skor_portfolio": <0-100>,
  "status": "<Sangat Baik | Baik | Perlu Perhatian | Kritis>",
  "ringkasan": "<1-2 kalimat overview untuk SEMUA goals dalam portfolio>",
  "issue_utama": [
    "<Issue 1 - sebutkan nama goal spesifik jika applicable>",
    "<Issue 2>",
    "<Issue 3>"
  ],
  "rekomendasi_singkat": [
    "<Rekomendasi 1 yang actionable>",
    "<Rekomendasi 2>"
  ],
  "perlu_deep_analysis": <true|false>
}

PANDUAN ANALISIS:
1. Jika HANYA 1 GOAL:
   - Fokus: Apakah target realistis? Butuh breakdown platform/strategi?
   - Issue: Timeline, resource untuk 1 goal ini, missing breakdown
   - Rekomen: Specific breakdown recommendations

2. Jika 2-3 GOALS:
   - Fokus: Resource conflict? Prioritas jelas? Timeline overlap?
   - Issue: Competing goals, team capacity, missing prioritization
   - Rekomen: Priority matrix, resource allocation strategy

3. Jika 4+ GOALS:
   - Fokus: OVERLOAD warning! Too many goals = focus dilution
   - Issue: Definitif warning tentang overload, resource impossible
   - Rekomen: SUGGEST prioritization/phasing (Q1-Q2, Q3-Q4)

ATURAN OUTPUT:
- Sebutkan nama goal spesifik dalam issue/rekomendasi (jangan generic)
- skor_portfolio: 
  * 80-100 = Sangat Baik (well-planned)
  * 60-79 = Baik (minor issues)
  * 40-59 = Perlu Perhatian (significant issues)
  * 0-39 = Kritis (major blockers)
- status: Harus match dengan skor
- issue_utama: Max 3, prioritized by severity
- rekomendasi_singkat: Max 3, actionable & specific
- perlu_deep_analysis: true jika ada kompleksitas tinggi

CONTOH OUTPUT (untuk 2 goals):
{
  "skor_portfolio": 55,
  "status": "Perlu Perhatian",
  "ringkasan": "Portfolio 2 goals ambisius (360M Impressi + 1M Follower) dengan resource terbatas dan timeline agresif 12 bulan",
  "issue_utama": [
    "Goal 'Target 360 Juta Impresi' membutuhkan 40-50 jam/minggu kerja, sementara hanya 1 Content Creator tersedia",
    "Timeline 12 bulan terlalu agresif untuk mencapai 1M follower organik tanpa budget paid ads",
    "Missing breakdown platform-specific (Instagram vs TikTok vs YouTube) untuk kedua goals"
  ],
  "rekomendasi_singkat": [
    "Hire 2-3 Content Creator tambahan atau kurangi target goal menjadi 200M impressions",
    "Phase timeline: Q1-Q2 fokus Goal Impressi, Q3-Q4 fokus Goal Follower",
    "Alokasikan budget Rp 30-50 juta/bulan untuk paid ads guna accelerate growth"
  ],
  "perlu_deep_analysis": true
}

PENTING:
- Output HARUS valid JSON (jangan ada markdown, jangan ada penjelasan tambahan)
- Gunakan bahasa Indonesia professional
- Fokus pada actionable insights, bukan teori
- Selesaikan dalam 15-30 detik
```

---

## 🔧 Implementasi di n8n

### Node Setup:
1. **AI Agent Node**
   - Model: GPT-4 atau GPT-3.5-turbo
   - Temperature: 0.3 (konsisten)
   - Max Tokens: 800 (cukup untuk JSON response)
   - System Message: (kosongkan, sudah ada di prompt)
   - User Message: (paste prompt di atas)

2. **Variable Mapping**:
   - `{{ $json.body.goals_summary }}` = Array dari webhook payload
   - `.map()` dan `.join()` = JavaScript methods (didukung n8n)
   - `.toLocaleString()` = Format angka dengan separator (contoh: 360000000 → 360,000,000)

3. **Code Node** (setelah AI Agent):
```javascript
// Parse AI response
const aiResponse = $input.first().json.output;

let parsedData;
try {
  // Jika output masih string, parse dulu
  parsedData = typeof aiResponse === 'string' 
    ? JSON.parse(aiResponse) 
    : aiResponse;
} catch (error) {
  // Fallback jika AI output tidak valid JSON
  parsedData = {
    skor_portfolio: 0,
    status: "Error",
    ringkasan: "AI response tidak valid",
    issue_utama: ["Parse error: " + error.message],
    rekomendasi_singkat: [],
    perlu_deep_analysis: false
  };
}

// Add metadata
const result = {
  analysis_id: `ANALYSIS_${Date.now()}`,
  analyzed_at: new Date().toISOString(),
  goals_analyzed: $json.body.goals_summary.length,
  ...parsedData,
  goals_detail: $json.body.goals_summary.map(g => ({
    goal_name: g.goal_name,
    target: `${g.target_value} ${g.target_unit}`,
    duration: `${g.duration_months} bulan`
  }))
};

return { json: result };
```

---

## 📊 Expected Output Examples

### Example 1: Single Goal
```json
{
  "analysis_id": "ANALYSIS_1730000000000",
  "analyzed_at": "2025-10-25T10:30:00Z",
  "goals_analyzed": 1,
  "skor_portfolio": 70,
  "status": "Baik",
  "ringkasan": "Goal '360M Impressi' adalah target ambisius namun achievable dengan strategi platform yang tepat",
  "issue_utama": [
    "Goal '360M Impressi' belum memiliki breakdown per platform (Instagram, TikTok, YouTube)",
    "Timeline 12 bulan butuh consistency 30M impressions/bulan - perlu content calendar ketat",
    "Belum jelas allocation organic vs paid ads"
  ],
  "rekomendasi_singkat": [
    "Breakdown target: 40% Instagram (144M), 35% TikTok (126M), 25% YouTube (90M)",
    "Alokasi 60% Organic (frequent posting) + 40% Paid Ads (budget Rp 30-40 juta/bulan)"
  ],
  "perlu_deep_analysis": true
}
```

### Example 2: 3 Goals
```json
{
  "analysis_id": "ANALYSIS_1730000000001",
  "analyzed_at": "2025-10-25T10:35:00Z",
  "goals_analyzed": 3,
  "skor_portfolio": 45,
  "status": "Perlu Perhatian",
  "ringkasan": "Portfolio 3 goals (360M Impressi, 1M Follower, 50% Engagement Rate) mengalami resource overload dan timeline overlap",
  "issue_utama": [
    "Goal 'Engagement Rate 50%' bertentangan dengan goal 'Impressi 360M' (quantity vs quality trade-off)",
    "Hanya 1 Content Creator untuk handle 3 goals kompleks - estimasi butuh 60-80 jam/minggu",
    "Timeline 12 bulan sama untuk 3 goals - tidak ada phasing/prioritization"
  ],
  "rekomendasi_singkat": [
    "PRIORITIZE: Q1-Q2 fokus Goal Impressi & Follower, Q3-Q4 fokus Engagement Rate",
    "Hire 2 Content Creator + 1 Social Media Manager (total team: 4 orang)",
    "Consider dropping Goal 'Engagement Rate' atau extend timeline menjadi 18-24 bulan"
  ],
  "perlu_deep_analysis": true
}
```

### Example 3: 6 Goals (Overload!)
```json
{
  "analysis_id": "ANALYSIS_1730000000002",
  "analyzed_at": "2025-10-25T10:40:00Z",
  "goals_analyzed": 6,
  "skor_portfolio": 25,
  "status": "Kritis",
  "ringkasan": "Portfolio 6 goals secara simultan adalah OVERLOAD KRITIS - focus dilution dan resource impossibility",
  "issue_utama": [
    "6 goals parallel dalam 12 bulan = setiap goal hanya dapat ~16% attention - recipe for failure",
    "Resource requirement estimation: 100+ jam/minggu (2.5 full-time employees minimum)",
    "Goals seperti '360M Impressi', '1M Follower', '10M Revenue' membutuhkan dedicated focus masing-masing"
  ],
  "rekomendasi_singkat": [
    "WAJIB: Reduce menjadi MAX 2-3 priority goals untuk tahun ini",
    "Phasing strategy: Year 1 (Goals A+B), Year 2 (Goals C+D), Year 3 (Goals E+F)",
    "Alternatif: Hire dedicated team 5-6 orang dengan clear goal ownership per person"
  ],
  "perlu_deep_analysis": true
}
```

---

## ✅ Testing Checklist

- [ ] Test dengan 1 goal
- [ ] Test dengan 2-3 goals (normal)
- [ ] Test dengan 5+ goals (overload)
- [ ] Test dengan goals yang conflict (quantity vs quality)
- [ ] Test dengan timeline berbeda-beda
- [ ] Verify JSON output valid
- [ ] Verify runtime < 30 detik
- [ ] Verify issue_utama menyebutkan nama goal spesifik

---

## 🚀 Next Steps

1. Copy prompt ke n8n AI Agent node
2. Test dengan existing 2 goals di database
3. Jika berhasil, test dengan add 3-4 goals lagi
4. Proceed ke UI implementation (modal display)
