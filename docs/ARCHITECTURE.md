# HRIS Next Gen - Workflow Architecture

## 🔄 Complete Data Flow: Form Submit → AI Analysis → Database

```
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: Manager Creates Goal                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  Manager fills form:   │
                  │  • Goal Name          │
                  │  • Target Value       │
                  │  • Business Unit      │
                  │  • Role               │
                  │  • Date Range         │
                  └───────────┬───────────┘
                              │ Click "Simpan Semua Goal"
                              ▼
                  ┌───────────────────────┐
                  │  POST /api/goals      │
                  │  (Next.js API Route)  │
                  └───────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               │               ▼
    ┌─────────────────┐       │     ┌──────────────────┐
    │ PostgreSQL DB   │       │     │ n8n Webhook      │
    │ strategic_goals │       │     │ (Real-time)      │
    │ status='Pending'│       │     └────────┬─────────┘
    └─────────────────┘       │              │
                              │              ▼
                              │     ┌──────────────────┐
                              │     │ Workflow #1      │
                              │     │ Triggers         │
                              │     └────────┬─────────┘
                              │              │
                              │              │
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 2: AI Analyzes Goal                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  n8n Webhook Node     │
                  │  Receives JSON:       │
                  │  {                    │
                  │    goal_id: "uuid",   │
                  │    goal_name: "...",  │
                  │    target_value: 360M,│
                  │    business_unit: "...",│
                  │    dates: [...]       │
                  │  }                    │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  OpenAI Node          │
                  │  (gpt-4o)             │
                  │                       │
                  │  Prompt:              │
                  │  "Analyze this goal   │
                  │   and recommend       │
                  │   platform & source   │
                  │   breakdown"          │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  AI Response:         │
                  │  {                    │
                  │    "breakdowns": [    │
                  │      {                │
                  │        "name": "Instagram",│
                  │        "value": 40    │
                  │      },               │
                  │      {                │
                  │        "name": "TikTok",│
                  │        "value": 35    │
                  │      },               │
                  │      ...              │
                  │    ]                  │
                  │  }                    │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  Code Node            │
                  │  (JavaScript)         │
                  │                       │
                  │  Format payload:      │
                  │  {                    │
                  │    goal_id: "uuid",   │
                  │    breakdowns: [...]  │
                  │  }                    │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  HTTP Request Node    │
                  │                       │
                  │  POST to Next.js:     │
                  │  /api/webhooks/       │
                  │  strategy-breakdown   │
                  └───────────┬───────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────────┐
│              STEP 3: Save AI Recommendations to DB              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  Next.js Webhook      │
                  │  /api/webhooks/       │
                  │  strategy-breakdown   │
                  │                       │
                  │  Receives:            │
                  │  {                    │
                  │    goal_id: "uuid",   │
                  │    breakdowns: [      │
                  │      {name, value}    │
                  │    ]                  │
                  │  }                    │
                  └───────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               │               ▼
    ┌─────────────────┐       │     ┌──────────────────┐
    │ PostgreSQL DB   │       │     │ PostgreSQL DB    │
    │ proposed_       │       │     │ strategic_goals  │
    │ breakdowns      │       │     │ UPDATE status =  │
    │                 │       │     │ 'Awaiting        │
    │ INSERT rows:    │       │     │  Breakdown       │
    │ • Instagram 40% │       │     │  Approval'       │
    │ • TikTok 35%    │       │     └──────────────────┘
    │ • Organik 60%   │
    │ • Paid Ads 40%  │
    │ status='pending'│
    └─────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────────┐
│             STEP 4: Manager Reviews AI Recommendations          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  Dashboard Page       │
                  │  /dashboard/goals     │
                  │                       │
                  │  Shows goal with      │
                  │  status: "Awaiting    │
                  │  Breakdown Approval"  │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  BreakdownApproval    │
                  │  Component renders    │
                  │                       │
                  │  Lists AI breakdowns: │
                  │  ✏️ Instagram: 40%    │
                  │  ✏️ TikTok: 35%       │
                  │  ✏️ Organik: 60%      │
                  │  ✏️ Paid Ads: 40%     │
                  │                       │
                  │  [Approve All]        │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  Manager clicks       │
                  │  "Approve All"        │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  PATCH /api/          │
                  │  breakdowns/[id]      │
                  │                       │
                  │  Update each row:     │
                  │  status = 'approved'  │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │  🎉 Ready for         │
                  │  Workflow #2          │
                  │  (KPI Generation)     │
                  └───────────────────────┘
```

---

## 📊 Data Flow Summary

| Step | Action | Who/What | Database Change | Status Change |
|------|--------|----------|-----------------|---------------|
| 1 | Manager creates goal | User via form | `strategic_goals` INSERT | → `Pending` |
| 2a | Trigger AI workflow | Next.js → n8n | None | No change |
| 2b | AI analyzes goal | n8n + OpenAI | None | No change |
| 2c | AI sends recommendations | n8n → Next.js webhook | `proposed_breakdowns` INSERT | Goal: → `Awaiting Breakdown Approval` |
| 3 | Manager reviews AI output | User via dashboard | None | No change |
| 4 | Manager approves breakdown | User clicks button | `proposed_breakdowns` UPDATE `status='approved'` | Goal: → `Awaiting KPI` |

---

## ⚡ Key Technical Details

### **Real-time Trigger (Not Polling)**
```typescript
// In /api/goals/route.ts (AFTER saving to DB)
await fetch(process.env.N8N_WORKFLOW_1_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    goal_id: goal.goal_id,
    goal_name: goal.goal_name,
    target_value: goal.target_value.toString(),
    // ... other fields
  }),
});
```

### **Why This Approach?**
✅ **Real-time**: AI starts processing immediately (no 5-minute delay)  
✅ **Decoupled**: n8n doesn't need database access  
✅ **Scalable**: Next.js remains the single source of truth  
✅ **Resilient**: If n8n is down, goal is still saved (error logged but not blocking)  

### **Error Handling**
```typescript
try {
  await fetch(n8nWebhook, {...});
  console.log('✅ n8n triggered');
} catch (error) {
  console.error('⚠️ n8n webhook failed:', error);
  // Don't fail the entire request
  // Goal is still saved, can retry later
}
```

---

## 🔗 Related Files

- **Form**: `app/dashboard/goals/create/page.tsx`
- **API Endpoint**: `app/api/goals/route.ts`
- **n8n Callback**: `app/api/webhooks/strategy-breakdown/route.ts`
- **Review Component**: `components/BreakdownApproval.tsx`
- **Dashboard**: `app/dashboard/goals/page.tsx`

---

## 🧪 Testing the Complete Flow

1. **Start Next.js**: `npm run dev`
2. **Create Goal**: Go to `/dashboard/goals/create`
3. **Check Console**: Should see `✅ n8n triggered for goal: [id]`
4. **Wait 5-10 seconds**: AI processing time
5. **Check Database**: `SELECT * FROM proposed_breakdowns`
6. **Go to Dashboard**: Should see "Awaiting Breakdown Approval"
7. **Review AI Output**: Click "Approve All"
8. **Done**: Status changes to "Awaiting KPI Approval"
