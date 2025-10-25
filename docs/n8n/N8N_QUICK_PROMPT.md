# N8N Quick Analysis Prompt (Short & Fast)

Copy prompt ini ke AI Agent node untuk mencegah timeout.

---

Analisis cepat portfolio goals berikut dalam BAHASA INDONESIA:

**GOALS:**
1. {{ $json.body.goals_summary[0].goal_name }}: {{ $json.body.goals_summary[0].target_value }} {{ $json.body.goals_summary[0].target_unit }}
2. {{ $json.body.goals_summary[1].goal_name }}: {{ $json.body.goals_summary[1].target_value }} {{ $json.body.goals_summary[1].target_unit }}

**CONTEXT:**
- Creator: {{ $json.body.goals_summary[0].created_by }} ({{ $json.body.goals_summary[0].creator_role }})
- Business: {{ $json.body.goals_summary[0].business_unit }}
- Timeline: 12 bulan (Oktober 2025 - Oktober 2026)
- Status: Both goals Pending

**TASK:**
Berikan assessment cepat (30 detik) fokus pada:
1. Apakah 1 Content Creator cukup untuk 2 goals ini?
2. Apakah timeline 12 bulan realistic?
3. Apa yang paling urgent untuk diaddress?

**OUTPUT (JSON only, no markdown):**
{
  "skor_portfolio": 65,
  "status": "Baik" atau "Perlu Perhatian" atau "Kritikal",
  "ringkasan": "1-2 kalimat ringkasan utama tentang kondisi portfolio",
  "issue_kritis": [
    "Issue paling urgent #1 (max 15 kata)",
    "Issue paling urgent #2 (max 15 kata)",
    "Issue paling urgent #3 (max 15 kata)"
  ],
  "action_prioritas": [
    {
      "action": "Action yang harus dilakukan (max 20 kata)",
      "urgency": "Tinggi" atau "Sedang",
      "estimasi_budget": "Rp 20-30 juta/bulan" atau "Tidak ada budget"
    }
  ]
}

**RULES:**
- Keep it short & actionable
- Focus on biggest bottleneck
- Budget dalam Rupiah
- Max 3 issues, max 3 actions
- Realistic untuk perusahaan Indonesia
