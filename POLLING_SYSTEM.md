# Polling System - Real-Time Analysis Status Updates

## 🎯 Overview

Sistem polling ini memberikan feedback real-time kepada user tentang status analisa AI tanpa perlu manual refresh. Ketika user klik "Rekomendasi AI", frontend akan:

1. Trigger analysis API
2. Start polling status setiap 3 detik
3. Show animated loading indicator
4. Auto-refresh ketika analisa selesai

---

## 🏗️ Architecture

```
┌──────────────┐
│   User UI    │ Click "Rekomendasi AI"
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│ POST /api/goals/analyze         │
│ - Generate batch_id (UUID)      │
│ - Create analysis_batches       │
│   (status: "Analyzing")         │
│ - Update strategic_goals        │
│ - POST to n8n webhook           │
└──────┬──────────────────────────┘
       │
       ├─────────────────────────┐
       │                         │
       ▼                         ▼
┌──────────────┐         ┌──────────────┐
│ Frontend     │         │ n8n Workflow │
│ Start        │         │ Processing   │
│ Polling      │         │ AI Analysis  │
└──────┬───────┘         └──────┬───────┘
       │                         │
       │ Every 3 seconds         │
       ▼                         │
┌─────────────────────────┐     │
│ GET /api/check-status/  │     │
│ [batch_id]              │     │
│                         │     │
│ Returns:                │     │
│ { status: "Analyzing" } │     │
└──────┬──────────────────┘     │
       │                         │
       │                         ▼
       │                 ┌───────────────┐
       │                 │ POST /api/    │
       │                 │ webhooks/     │
       │                 │ analysis-     │
       │                 │ result        │
       │                 │               │
       │                 │ UPDATE status │
       │                 │ → Review_     │
       │                 │   Pending     │
       │                 └───────────────┘
       │                         │
       ▼                         │
┌─────────────────────────┐     │
│ GET /api/check-status/  │◄────┘
│ [batch_id]              │
│                         │
│ Returns:                │
│ { status: "Review_      │
│   Pending" }            │
└──────┬──────────────────┘
       │
       ▼
┌──────────────────────┐
│ Stop Polling         │
│ fetchGoals()         │
│ router.refresh()     │
│ Show Success Message │
└──────────────────────┘
```

---

## 📁 File Structure

```
app/
├── api/
│   ├── goals/
│   │   └── analyze/
│   │       └── route.ts          ← Generate batch_id, trigger n8n
│   ├── check-status/
│   │   └── [batch_id]/
│   │       └── route.ts          ← Status polling endpoint
│   └── webhooks/
│       └── analysis-result/
│           └── route.ts          ← n8n callback (update status)
└── dashboard/
    └── goals/
        └── page.tsx              ← Frontend polling logic + UI
```

---

## 🔧 Implementation Details

### 1. Backend: Status Check Endpoint

**File**: `app/api/check-status/[batch_id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

**Response Example**:
```json
{
  "batch_id": "550e8400-e29b-41d4-a716-446655440000",
  "batch_name": "Portfolio Analysis 2025-10-24",
  "status": "Analyzing",
  "created_at": "2025-10-24T10:30:00.000Z",
  "has_recommendation": false
}
```

---

### 2. Frontend: Polling Logic

**File**: `app/dashboard/goals/page.tsx`

#### State Management

```typescript
// Polling states
const [pollingBatchId, setPollingBatchId] = useState<string | null>(null);
const [pollingActive, setPollingActive] = useState(false);
const [pollingAttempts, setPollingAttempts] = useState(0);
const [analyzingGoals, setAnalyzingGoals] = useState(false);
```

#### Polling useEffect

```typescript
useEffect(() => {
  if (!pollingActive || !pollingBatchId) return;

  const MAX_ATTEMPTS = 60; // 3 minutes timeout (60 × 3 seconds)

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
        setPollingAttempts(0);
        setAnalyzingGoals(false);
        setAnalysisResult('✅ Analisa selesai! Memuat ulang data...');
        
        await fetchGoals();
        router.refresh();
        
        setTimeout(() => setAnalysisResult(null), 3000);
      } else if (pollingAttempts >= MAX_ATTEMPTS) {
        // TIMEOUT: Stop after max attempts
        clearInterval(pollInterval);
        setPollingActive(false);
        setPollingBatchId(null);
        setPollingAttempts(0);
        setAnalyzingGoals(false);
        setAnalysisResult('⚠️ Analisa memakan waktu lama. Silakan refresh halaman.');
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 3000); // Poll every 3 seconds

  return () => clearInterval(pollInterval);
}, [pollingActive, pollingBatchId, pollingAttempts, router]);
```

#### Trigger Function

```typescript
const handleAnalyzeGoals = async () => {
  if (goals.length === 0) {
    alert('Tidak ada goals untuk dianalisa');
    return;
  }

  setAnalyzingGoals(true);
  setAnalysisResult(null);
  setPollingAttempts(0);

  try {
    const response = await fetch('/api/goals/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (response.ok) {
      if (data.dev_mode) {
        // Development mode - no polling needed
        setAnalysisResult('✅ Dev mode - no n8n webhook');
        setAnalyzingGoals(false);
      } else {
        // Production mode - start polling
        setPollingBatchId(data.batch_id);
        setPollingActive(true);
        // analyzingGoals stays true during polling
      }
    } else {
      setAnalysisResult(`❌ ${data.message || data.error}`);
      setAnalyzingGoals(false);
    }
  } catch (error) {
    console.error('Error:', error);
    setAnalysisResult('❌ Connection failed');
    setAnalyzingGoals(false);
  }
};
```

---

### 3. UI Components

#### Button with Polling Counter

```tsx
<button
  onClick={handleAnalyzeGoals}
  disabled={analyzingGoals || goals.length === 0}
  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg"
>
  {analyzingGoals ? (
    <>
      <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
      {pollingActive ? `Polling... (${pollingAttempts})` : 'Menganalisa...'}
    </>
  ) : (
    <>🤖 Rekomendasi AI</>
  )}
</button>
```

#### Loading Animation Card

```tsx
{pollingActive && (
  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 shadow-sm">
    <div className="flex items-center gap-4">
      {/* Spinning Circle with Robot Icon */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl">
          🤖
        </div>
      </div>
      
      {/* Progress Info */}
      <div className="flex-1">
        <h4 className="font-semibold text-purple-900 mb-1">
          AI sedang menganalisa goals Anda...
        </h4>
        <p className="text-sm text-purple-700 mb-2">
          Memeriksa status analisa: <span className="font-mono font-semibold">{pollingAttempts}</span> kali
        </p>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: `${Math.min((pollingAttempts / 60) * 100, 100)}%` }}
            ></div>
          </div>
          <span className="text-xs text-purple-600 font-mono">
            {Math.round((pollingAttempts / 60) * 100)}%
          </span>
        </div>
        
        <p className="text-xs text-purple-600 mt-2">
          💡 Jangan tutup halaman ini. Refresh otomatis akan dilakukan setelah analisa selesai.
        </p>
      </div>
    </div>
  </div>
)}
```

---

## 🔄 Status Flow

### Database Status Transitions

```
analysis_batches.status:

1. "Analyzing"      ← Initial state (set by /api/goals/analyze)
   │
   ├─ Frontend polling active
   ├─ n8n workflow processing
   │
2. "Review_Pending" ← Updated by /api/webhooks/analysis-result
   │
   ├─ Frontend detects change
   ├─ Stop polling
   ├─ Refresh page
   │
3. "Completed"      ← Future: After manager reviews recommendations
```

### Polling Decision Tree

```
Start Polling
    │
    ▼
┌─────────────────────┐
│ Fetch Status        │
│ Every 3 Seconds     │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────┐
│ Check status value       │
└──────┬───────────────────┘
       │
       ├─► "Analyzing" ──────────► Continue Polling
       │                           (increment attempts)
       │
       ├─► "Review_Pending" ──────► STOP + Refresh
       │
       ├─► "Completed" ───────────► STOP + Refresh
       │
       └─► attempts >= 60 ────────► STOP + Show Timeout Message
```

---

## ⏱️ Timing Configuration

| Parameter | Value | Reason |
|-----------|-------|--------|
| **Poll Interval** | 3 seconds | Balance between responsiveness & server load |
| **Max Attempts** | 60 | 3 minutes total (60 × 3s = 180s) |
| **Timeout Message** | After 3 minutes | Prevent infinite polling |
| **Success Message** | 3 seconds display | Brief confirmation before auto-hide |

---

## 🧪 Testing Scenarios

### Test Case 1: Normal Flow (Success)

**Steps**:
1. Click "🤖 Rekomendasi AI"
2. Observe polling counter incrementing
3. Wait for n8n workflow to complete (~10-30 seconds)
4. Verify status changes to "Review_Pending"
5. Page auto-refreshes
6. Goals list shows updated batch_id

**Expected**:
- Polling starts immediately
- Counter: 1, 2, 3, 4...
- Animation shows progress bar moving
- Success message appears
- Page refreshes automatically

---

### Test Case 2: Timeout Scenario

**Steps**:
1. Modify `MAX_ATTEMPTS = 5` (for quick test)
2. Click "🤖 Rekomendasi AI"
3. Wait 15 seconds (5 attempts × 3s)
4. Verify timeout message appears

**Expected**:
- Polling stops after 5 attempts
- Message: "⚠️ Analisa memakan waktu lama..."
- analyzingGoals = false
- Polling indicator disappears

---

### Test Case 3: Multiple Goals

**Steps**:
1. Create 3-4 strategic goals
2. Click "🤖 Rekomendasi AI"
3. Verify batch_id is same for all goals
4. Check polling status
5. Verify all goals refresh together

**Expected**:
- Single batch_id for all goals
- Polling tracks one batch
- All goals show same batch_id after refresh

---

### Test Case 4: Error Handling

**Scenario A**: Network failure during polling
```typescript
// Polling continues despite fetch errors
// Console logs error but doesn't crash
```

**Scenario B**: Batch not found
```typescript
// 404 response from /api/check-status/[batch_id]
// Show error message, stop polling
```

**Scenario C**: n8n webhook fails
```typescript
// Status never changes from "Analyzing"
// Timeout after 3 minutes
// User gets timeout message
```

---

## 🐛 Debugging Guide

### Check Polling State

**Browser Console**:
```javascript
// Open React DevTools and check these states:
pollingActive      // Should be true during polling
pollingBatchId     // Should match database batch_id
pollingAttempts    // Should increment every 3 seconds
analyzingGoals     // Should stay true during polling
```

---

### Verify Database Status

**SQL Query**:
```sql
SELECT 
  batch_id, 
  batch_name, 
  status, 
  created_at,
  ai_team_recommendation IS NOT NULL as has_data
FROM analysis_batches
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Progression**:
```
Time 0s:  status = "Analyzing", has_data = false
Time 15s: status = "Analyzing", has_data = false (n8n still working)
Time 25s: status = "Review_Pending", has_data = true (n8n complete!)
```

---

### Network Monitoring

**Chrome DevTools → Network Tab**:

1. Filter: XHR/Fetch
2. Look for: `/api/check-status/[uuid]`
3. Verify:
   - Requests every ~3 seconds
   - Response status 200
   - Response body contains `{ "status": "..." }`

**Example Timeline**:
```
0s   → POST /api/goals/analyze (trigger)
3s   → GET /api/check-status/xxx (status: "Analyzing")
6s   → GET /api/check-status/xxx (status: "Analyzing")
9s   → GET /api/check-status/xxx (status: "Analyzing")
12s  → GET /api/check-status/xxx (status: "Analyzing")
15s  → GET /api/check-status/xxx (status: "Analyzing")
18s  → GET /api/check-status/xxx (status: "Analyzing")
21s  → GET /api/check-status/xxx (status: "Review_Pending") ← STOP!
21s  → Refresh page, fetchGoals()
```

---

### Common Issues & Solutions

#### Issue: Polling never starts
**Symptoms**: No status checks in Network tab
**Cause**: `pollingActive` or `pollingBatchId` not set
**Solution**:
```typescript
// Check handleAnalyzeGoals after successful response:
console.log('Starting polling:', {
  batchId: data.batch_id,
  devMode: data.dev_mode
});
setPollingBatchId(data.batch_id);
setPollingActive(true);
```

---

#### Issue: Polling never stops
**Symptoms**: Counter keeps incrementing beyond expected time
**Cause**: Status not changing to "Review_Pending"
**Solution**:
1. Check n8n workflow completed successfully
2. Verify `/api/webhooks/analysis-result` received callback
3. Query database: `SELECT status FROM analysis_batches WHERE batch_id = 'xxx'`
4. If status stuck on "Analyzing", check n8n HTTP Request node configuration

---

#### Issue: "Batch not found" error
**Symptoms**: 404 response from status endpoint
**Cause**: batch_id mismatch or not created
**Solution**:
```typescript
// Verify batch_id matches in both places:
// 1. Frontend state
console.log('Polling batch:', pollingBatchId);

// 2. Database
SELECT batch_id FROM analysis_batches ORDER BY created_at DESC LIMIT 1;
```

---

#### Issue: Timeout too aggressive
**Symptoms**: Timeout message before n8n completes
**Cause**: `MAX_ATTEMPTS` too low for complex analysis
**Solution**:
```typescript
// Increase timeout for production
const MAX_ATTEMPTS = 120; // 6 minutes instead of 3
```

---

## 📊 Performance Metrics

### Expected Performance

| Metric | Value | Notes |
|--------|-------|-------|
| **Average Analysis Time** | 15-30 seconds | Depends on goal count & AI model |
| **Polling Overhead** | ~0.5 KB/request | Minimal JSON response |
| **Network Requests** | 5-10 per analysis | Most analyses complete in 30s |
| **User Perceived Wait** | 20-35 seconds | Polling + animation makes it feel faster |

### Optimization Tips

1. **Reduce Poll Interval** (only if needed):
   ```typescript
   const pollInterval = setInterval(async () => {
     // ... polling logic
   }, 2000); // 2 seconds instead of 3
   ```

2. **Exponential Backoff** (advanced):
   ```typescript
   const delay = Math.min(3000 + (pollingAttempts * 500), 10000);
   // Start at 3s, increase by 0.5s each attempt, max 10s
   ```

3. **WebSocket Alternative** (future enhancement):
   - Replace polling with WebSocket connection
   - Server pushes status updates in real-time
   - No repeated HTTP requests

---

## 🚀 Future Enhancements

### 1. Server-Sent Events (SSE)
Replace polling with push notifications:
```typescript
// Backend: /api/status-stream/[batch_id]
const eventStream = new EventSource(`/api/status-stream/${batchId}`);
eventStream.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.status === 'Review_Pending') {
    eventStream.close();
    refreshPage();
  }
};
```

### 2. Progress Percentage from n8n
Send progress updates during analysis:
```json
{
  "status": "Analyzing",
  "progress": 45,
  "current_step": "Analyzing Goal 2/4"
}
```

### 3. Notification on Completion
Browser notification when analysis completes:
```typescript
if (Notification.permission === 'granted') {
  new Notification('Analysis Complete!', {
    body: 'Your goals have been analyzed by AI',
    icon: '/robot-icon.png'
  });
}
```

### 4. Background Tab Handling
Pause polling when tab inactive, resume on focus:
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden && pollingActive) {
      // Pause polling
      setPollingPaused(true);
    } else if (!document.hidden && pollingPaused) {
      // Resume polling
      setPollingPaused(false);
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [pollingActive, pollingPaused]);
```

---

## 📚 Related Documentation

- **N8N_WORKFLOW_SETUP.md** - Full n8n workflow configuration
- **N8N_QUICK_PROMPT_DYNAMIC.md** - AI prompt for analysis
- **agents.md** - Overall system architecture
- **DATABASE.md** - Database schema for analysis_batches

---

## 🎓 Key Takeaways

1. **Polling is simple but effective** for this use case (low frequency, predictable duration)
2. **Always implement timeout** to prevent infinite loops
3. **Visual feedback is crucial** - users need to see progress
4. **Error handling must be robust** - network issues are common
5. **Database status is source of truth** - frontend just reflects it

---

**Last Updated**: 2025-10-24  
**Version**: 1.0  
**Author**: HRIS Next Gen Development Team
