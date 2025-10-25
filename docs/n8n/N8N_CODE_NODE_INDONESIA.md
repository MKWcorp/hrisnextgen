# N8N Code Node - Parse AI Response (FIXED VERSION)

Gunakan code ini untuk Node 3 (Code) di n8n workflow - **setelah AI Agent node**.

```javascript
// Get AI response from previous AI Agent node
const aiOutput = $input.first().json;

let analysisResult;

// Parse AI output (bisa string atau object)
if (typeof aiOutput.output === 'string') {
  try {
    // Remove markdown code blocks if AI returns ```json...```
    let cleaned = aiOutput.output
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    analysisResult = JSON.parse(cleaned);
  } catch (error) {
    console.error('JSON parse error:', error.message);
    
    // Fallback: Return error structure
    return {
      json: {
        error: 'Failed to parse AI response',
        parse_error: error.message,
        raw_output: aiOutput.output,
        analysis_id: `ANALYSIS_ERROR_${Date.now()}`,
        analyzed_at: new Date().toISOString()
      }
    };
  }
} else if (typeof aiOutput.output === 'object') {
  // Already an object
  analysisResult = aiOutput.output;
} else {
  // Unexpected format
  analysisResult = aiOutput;
}

// Add metadata
const webhookData = $('Webhook').item.json.body;
const finalResult = {
  analysis_id: `ANALYSIS_${Date.now()}`,
  analyzed_at: new Date().toISOString(),
  goals_analyzed: webhookData.total_goals || webhookData.goals_summary?.length || 0,
  
  // Core analysis data
  skor_portfolio: analysisResult.skor_portfolio || 0,
  status: analysisResult.status || 'Unknown',
  ringkasan: analysisResult.ringkasan || '',
  issue_utama: analysisResult.issue_utama || [],
  rekomendasi_singkat: analysisResult.rekomendasi_singkat || [],
  perlu_deep_analysis: analysisResult.perlu_deep_analysis || false,
  
  // Summary card for quick display
  summary_card: {
    skor: analysisResult.skor_portfolio || 0,
    status_text: analysisResult.status || 'Unknown',
    total_issues: (analysisResult.issue_utama || []).length,
    total_recommendations: (analysisResult.rekomendasi_singkat || []).length,
    needs_attention: analysisResult.skor_portfolio < 60
  },
  
  // Goals context
  goals_detail: webhookData.goals_summary?.map(g => ({
    goal_name: g.goal_name,
    target: `${g.target_value} ${g.target_unit}`,
    duration: `${g.duration_months} bulan`,
    timeline: `${g.start_date} - ${g.end_date}`
  })) || []
};

// Return structured result
return { json: finalResult };
```

---

## 🔧 Setup di n8n

### Node 3: Code (setelah AI Agent)

**Settings**:
- Language: JavaScript
- Mode: Run Once for All Items

**Code**: (copy dari atas)

---

## 📤 Expected Output

```json
{
  "analysis_id": "ANALYSIS_1730000000000",
  "analyzed_at": "2025-10-25T10:30:00.000Z",
  "goals_analyzed": 2,
  "skor_portfolio": 56,
  "status": "Perlu Perhatian",
  "ringkasan": "Dua goal ambisius (1.000.000 Follower dan 360.000.000 Impressi)...",
  "issue_utama": [
    "Kapasitas tim: Goal 'Impressi' (360M)...",
    "Durasi goal belum terdefinisi...",
    "Tidak ada prioritas/fase..."
  ],
  "rekomendasi_singkat": [
    "Tetapkan prioritas & phasing...",
    "Tambah resource & budget...",
    "Buat breakdown platform..."
  ],
  "perlu_deep_analysis": true,
  "summary_card": {
    "skor": 56,
    "status_text": "Perlu Perhatian",
    "total_issues": 3,
    "total_recommendations": 3,
    "needs_attention": true
  },
  "goals_detail": [
    {
      "goal_name": "Follower",
      "target": "1000000 Followers",
      "duration": "12 bulan",
      "timeline": "2025-10-24 - 2026-10-24"
    },
    {
      "goal_name": "Impressi",
      "target": "360000000 Impressions",
      "duration": "12 bulan",
      "timeline": "2025-10-24 - 2026-10-24"
    }
  ]
}
```
