# N8N Workflow Setup - Portfolio Analysis

## 🎯 Workflow Overview

```
Node 1: Webhook (Receive)
   ↓
Node 2: AI Agent (Analyze)
   ↓
Node 3: Code (Parse & Format)
   ↓
Node 4: HTTP Request (Save to DB)
   ↓
Node 5: Respond to Webhook (Return result)
```

---

## 📋 Node-by-Node Configuration

### **Node 1: Webhook**

**Type**: Webhook (Production URL)  
**Webhook Path**: `hrisnextgen-analyze`  
**Method**: POST  
**Response Mode**: When Last Node Finishes

**Expected Input**:
```json
{
  "analysis_type": "portfolio_review",
  "total_goals": 2,
  "goals_summary": [
    {
      "goal_id": "uuid",
      "goal_name": "Follower",
      "target_value": "1000000",
      "target_unit": "Followers",
      "status": "Pending",
      "business_unit": "DRW Estetika",
      "created_by": "Andi Wijaya",
      "creator_role": "Content Creator",
      "start_date": "2025-10-24",
      "end_date": "2026-10-24",
      "duration_months": 12,
      "kpi_count": 0,
      "kpi_approved": 0
    }
  ]
}
```

---

### **Node 2: AI Agent**

**Type**: AI Agent  
**Model**: GPT-4 atau GPT-3.5-turbo  
**Temperature**: 0.3  
**Max Tokens**: 800

**Prompt** (copy dari `N8N_QUICK_PROMPT_DYNAMIC.md`):
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
  * 80-100 = Sangat Baik
  * 60-79 = Baik
  * 40-59 = Perlu Perhatian
  * 0-39 = Kritis
- status: Harus match dengan skor
- issue_utama: Max 3, prioritized by severity
- rekomendasi_singkat: Max 3, actionable & specific

PENTING:
- Output HARUS valid JSON object (not string)
- Jangan ada markdown, jangan ada penjelasan tambahan
- Fokus pada actionable insights
- Selesaikan dalam 15-30 detik
```

---

### **Node 3: Code**

**Type**: Code (JavaScript)  
**Mode**: Run Once for All Items

**Code** (copy dari `N8N_CODE_NODE_INDONESIA.md`):
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

### **Node 4: HTTP Request**

**Type**: HTTP Request  
**Method**: POST  
**URL**: `http://localhost:3000/api/webhooks/analysis-result`  
**Authentication**: None  
**Body Content Type**: JSON

**Body** (using Fields Below):
- Send Body: ✅ Enabled
- Body Content Type: JSON
- Specify Body: Using Fields Below

**Body Parameters**:
- Name: (leave empty)
- Value: `{{ JSON.stringify($json) }}`

**Alternative - Raw JSON**:
```
{{ $json }}
```

**Settings**:
- Response Format: JSON
- Full Response: ❌ Disabled (only need body)
- Ignore SSL Issues: ❌ Disabled
- Timeout: 30000 (30 seconds)

---

### **Node 5: Respond to Webhook**

**Type**: Respond to Webhook  
**Respond With**: JSON

**Response Body** (using Expression):
```json
{
  "success": true,
  "message": "Analysis completed successfully",
  "analysis_id": "{{ $('Code').item.json.analysis_id }}",
  "skor_portfolio": {{ $('Code').item.json.skor_portfolio }},
  "status": "{{ $('Code').item.json.status }}",
  "analyzed_at": "{{ $('Code').item.json.analyzed_at }}"
}
```

---

## 🧪 Testing Workflow

### 1. Test dengan cURL (dari terminal):
```bash
curl -X POST https://n8n.drwapp.com/webhook/hrisnextgen-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "analysis_type": "portfolio_review",
    "total_goals": 2,
    "goals_summary": [
      {
        "goal_name": "Follower",
        "target_value": "1000000",
        "target_unit": "Followers",
        "duration_months": 12,
        "start_date": "2025-10-24",
        "end_date": "2026-10-24",
        "business_unit": "DRW Estetika",
        "created_by": "Andi Wijaya",
        "creator_role": "Content Creator"
      },
      {
        "goal_name": "Impressi",
        "target_value": "360000000",
        "target_unit": "Impressions",
        "duration_months": 12,
        "start_date": "2025-10-24",
        "end_date": "2026-10-24",
        "business_unit": "DRW Estetika",
        "created_by": "Andi Wijaya",
        "creator_role": "Content Creator"
      }
    ]
  }'
```

### 2. Test dari Next.js Dashboard:
- Klik tombol **"🤖 Rekomendasi AI"** di `/dashboard/goals`
- Lihat console log di Next.js dev server
- Cek database `analysis_results` table

### 3. Verify Database:
```sql
SELECT * FROM analysis_results ORDER BY created_at DESC LIMIT 1;
```

---

## ❌ Troubleshooting

### Error: "The service refused the connection"
**Penyebab**: Next.js dev server tidak running atau URL salah  
**Solusi**:
1. Pastikan `npm run dev` running di `localhost:3000`
2. Cek URL di Node 4: `http://localhost:3000/api/webhooks/analysis-result`
3. Jika production, ganti dengan domain production

### Error: "Webhook not registered"
**Penyebab**: Workflow belum aktif  
**Solusi**:
1. Toggle workflow ke **Active** (switch di kanan atas)
2. Wait 5-10 detik
3. Test lagi

### Error: "JSON parse error"
**Penyebab**: AI return format tidak valid  
**Solusi**:
1. Cek output AI Agent node
2. Pastikan prompt include: "Output HARUS valid JSON object"
3. Code node sudah handle string → object conversion

### Error: "Database constraint violation"
**Penyebab**: `analysis_id` sudah exist  
**Solusi**:
- Sudah handled dengan `ON CONFLICT DO UPDATE`
- Jika masih error, cek schema `analysis_results`

---

## ✅ Success Indicators

1. **Node 2 (AI Agent)** output: Valid JSON dengan 6 fields
2. **Node 3 (Code)** output: Structured object dengan `analysis_id`, `summary_card`, `goals_detail`
3. **Node 4 (HTTP Request)** response: `{ "success": true, ... }`
4. **Database**: Row baru di `analysis_results` table
5. **Next.js console**: Log "✅ Analysis saved to database"

---

## � Frontend Polling System

### Overview

Setelah user klik "Rekomendasi AI", sistem menggunakan **polling mechanism** untuk mengecek status analisa secara real-time:

```
User Click "Rekomendasi AI"
   ↓
POST /api/goals/analyze (Generate batch_id)
   ↓
Create analysis_batches (status: "Analyzing")
   ↓
Trigger n8n webhook
   ↓
Frontend START POLLING ← You are here
   ↓ (every 3 seconds)
GET /api/check-status/[batch_id]
   ↓
Check analysis_batches.status
   ↓
Status = "Review_Pending"? 
   ↓ YES → STOP POLLING + REFRESH PAGE
   ↓ NO  → CONTINUE POLLING (max 60 attempts = 3 minutes)
```

---

### Polling Logic Implementation

**File**: `app/dashboard/goals/page.tsx`

**State Management**:
```typescript
const [pollingBatchId, setPollingBatchId] = useState<string | null>(null);
const [pollingActive, setPollingActive] = useState(false);
const [pollingAttempts, setPollingAttempts] = useState(0);
```

**Polling useEffect**:
```typescript
useEffect(() => {
  if (!pollingActive || !pollingBatchId) return;

  const MAX_ATTEMPTS = 60; // 3 minutes timeout

  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`/api/check-status/${pollingBatchId}`);
      const data = await response.json();

      setPollingAttempts(prev => prev + 1);

      if (data.status === 'Review_Pending' || data.status === 'Completed') {
        // SUCCESS: Analysis complete
        clearInterval(pollInterval);
        setPollingActive(false);
        setPollingBatchId(null);
        await fetchGoals();
        router.refresh();
      } else if (pollingAttempts >= MAX_ATTEMPTS) {
        // TIMEOUT: Stop after 3 minutes
        clearInterval(pollInterval);
        setPollingActive(false);
        setAnalysisResult('⚠️ Analisa timeout. Refresh untuk cek status.');
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 3000); // Poll every 3 seconds

  return () => clearInterval(pollInterval);
}, [pollingActive, pollingBatchId, pollingAttempts]);
```

---

### API Endpoint: Status Check

**File**: `app/api/check-status/[batch_id]/route.ts`

**Method**: GET  
**URL Pattern**: `/api/check-status/[batch_id]`

**Response**:
```json
{
  "batch_id": "550e8400-e29b-41d4-a716-446655440000",
  "batch_name": "Portfolio Analysis 2025-10-24",
  "status": "Analyzing | Review_Pending | Completed",
  "created_at": "2025-10-24T10:30:00.000Z",
  "has_recommendation": false
}
```

**Implementation**:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { batch_id: string } }
) {
  const { batch_id } = params;

  const batch = await prisma.analysis_batches.findUnique({
    where: { batch_id },
    select: {
      batch_id: true,
      batch_name: true,
      status: true,
      created_at: true,
      ai_team_recommendation: true,
    },
  });

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
  }

  return NextResponse.json({
    batch_id: batch.batch_id,
    batch_name: batch.batch_name,
    status: batch.status,
    created_at: batch.created_at,
    has_recommendation: batch.ai_team_recommendation !== null,
  });
}
```

---

### Loading Animation

**Visual Components**:

1. **Button State**:
   ```tsx
   {analyzingGoals ? (
     <>
       <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
       {pollingActive ? `Polling... (${pollingAttempts})` : 'Menganalisa...'}
     </>
   ) : (
     <>🤖 Rekomendasi AI</>
   )}
   ```

2. **Full Loading Card**:
   ```tsx
   {pollingActive && (
     <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
       <div className="flex items-center gap-4">
         {/* Spinning Circle with Robot Icon */}
         <div className="relative">
           <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">🤖</div>
         </div>
         
         {/* Progress Info */}
         <div className="flex-1">
           <h4 className="font-semibold text-purple-900">
             AI sedang menganalisa goals Anda...
           </h4>
           <p className="text-sm text-purple-700">
             Memeriksa status: <span className="font-mono">{pollingAttempts}</span> kali
           </p>
           
           {/* Progress Bar */}
           <div className="flex items-center gap-2 mt-2">
             <div className="flex-1 h-2 bg-purple-200 rounded-full">
               <div 
                 className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse"
                 style={{ width: `${Math.min((pollingAttempts / 60) * 100, 100)}%` }}
               />
             </div>
             <span className="text-xs font-mono">{Math.round((pollingAttempts / 60) * 100)}%</span>
           </div>
           
           <p className="text-xs text-purple-600 mt-2">
             💡 Jangan tutup halaman ini. Refresh otomatis akan dilakukan.
           </p>
         </div>
       </div>
     </div>
   )}
   ```

---

### Status Flow Diagram

```
┌─────────────────────┐
│ User Click Button   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ POST /api/goals/analyze     │
│ - Generate UUID batch_id    │
│ - Create analysis_batches   │
│   (status: "Analyzing")     │
│ - Trigger n8n webhook       │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ setPollingActive(true)      │
│ setPollingBatchId(uuid)     │
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Polling Loop     │◄─────┐
    │ Every 3 seconds  │      │
    └──────┬───────────┘      │
           │                   │
           ▼                   │
    ┌────────────────────────┐│
    │ GET /api/check-status/ ││
    │ Returns: { status }    ││
    └──────┬─────────────────┘│
           │                   │
      ┌────▼────┐             │
      │ Status? │             │
      └────┬────┘             │
           │                   │
    ┌──────┴──────┐           │
    │             │           │
    ▼             ▼           │
"Analyzing"  "Review_Pending" │
    │             │           │
    └─────────────┤           │
                  │           │
       Continue ──┘           │
       Polling                │
                               │
    ┌──────────────────────┐  │
    │ Stop Polling         │  │
    │ fetchGoals()         │  │
    │ router.refresh()     │  │
    │ Show success message │  │
    └──────────────────────┘  │
```

---

### Timeout Handling

**Scenario**: n8n workflow gagal atau terlalu lama (> 3 menit)

**Solution**:
```typescript
const MAX_ATTEMPTS = 60; // 60 attempts × 3 seconds = 3 minutes

if (pollingAttempts >= MAX_ATTEMPTS) {
  clearInterval(pollInterval);
  setPollingActive(false);
  setAnalysisResult('⚠️ Analisa memakan waktu lama. Silakan refresh halaman.');
}
```

**User Action**: Manual refresh untuk cek status

---

### Database Status Updates

**n8n Webhook** (Node 4: HTTP Request) will update status:

```typescript
// In /api/webhooks/analysis-result
await prisma.analysis_batches.update({
  where: { batch_id: receivedBatchId },
  data: {
    status: 'Review_Pending', // ← This triggers polling stop
    ai_team_recommendation: fullAnalysisData,
  },
});
```

---

### Testing Polling System

**1. Manual Test**:
```bash
# Terminal 1: Run Next.js dev server
cd hris-dashboard
npm run dev

# Terminal 2: Watch database changes
# Open Prisma Studio or SQL client
SELECT batch_id, status, created_at 
FROM analysis_batches 
ORDER BY created_at DESC;
```

**2. Simulate Slow Analysis**:
- Add `setTimeout` in n8n Code node (Node 3)
- Observe frontend polling counter incrementing
- Verify loading animation displays correctly

**3. Simulate Timeout**:
- Set `MAX_ATTEMPTS = 5` (15 seconds) temporarily
- Trigger analysis
- Verify timeout message appears after 5 attempts

**4. Verify Success Flow**:
- Click "Rekomendasi AI"
- Watch polling counter increase
- n8n completes → status changes to "Review_Pending"
- Frontend auto-refreshes within 3 seconds
- Goals list shows updated batch_id

---

### Troubleshooting Polling

**Issue**: Polling never stops  
**Cause**: Status not changing to "Review_Pending"  
**Solution**: 
1. Check n8n webhook received batch_id correctly
2. Verify `/api/webhooks/analysis-result` updates status
3. Check database: `SELECT status FROM analysis_batches WHERE batch_id = 'xxx'`

**Issue**: "Batch not found" error  
**Cause**: batch_id mismatch or database not updated  
**Solution**:
1. Verify batch_id in frontend matches database
2. Check `/api/goals/analyze` creates `analysis_batches` record
3. Console log batch_id in both frontend and API

**Issue**: Polling stops immediately  
**Cause**: Status already "Review_Pending" before polling starts  
**Solution**: 
1. Ensure initial status is "Analyzing" (not "Review_Pending")
2. Check `/api/goals/analyze` sets correct initial status

**Issue**: Progress bar doesn't move  
**Cause**: pollingAttempts state not updating  
**Solution**: Check useEffect dependencies include `pollingAttempts`

---

## �📊 Expected Database Record

```sql
-- Example row in analysis_results
analysis_id          | ANALYSIS_1730000000000
analyzed_at          | 2025-10-25 10:30:00
goals_analyzed       | 2
skor_portfolio       | 56
status              | Perlu Perhatian
quick_summary       | Dua goal ambisius dengan resource terbatas...
full_analysis       | {"skor_portfolio": 56, "issue_utama": [...], ...}
approved_recommendations | null
status_workflow     | quick_done
created_at          | 2025-10-25 10:30:00
```

---

## 🚀 Next Steps After Setup

1. **Test dengan 1 goal** → AI harus detect "single goal analysis"
2. **Test dengan 4+ goals** → AI harus warning "overload"
3. **Build UI** untuk display analysis results
4. **Add approval flow** untuk recommendations
5. **Implement Layer 2** (Deep Analysis) on-demand

---

Dokumentasi lengkap tersedia di:
- `N8N_QUICK_PROMPT_DYNAMIC.md` - AI Prompt
- `N8N_CODE_NODE_INDONESIA.md` - Code Node
- `N8N_MULTI_LAYER_ANALYSIS.md` - Architecture
