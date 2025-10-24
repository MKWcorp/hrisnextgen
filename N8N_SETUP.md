# n8n Setup Guide - HRIS Next Gen

This document explains how to configure the n8n workflows for AI-powered goal breakdown, KPI generation, and task generation.

---

## 🔗 Webhook URLs

**n8n Workflow #1 (Strategy Consultant)**:
- **Production URL**: `https://n8n.drwapp.com/webhook/hrisnextgen`
- **Environment Variable**: `N8N_WORKFLOW_1_WEBHOOK_URL`

**n8n Workflow #2 (KPI Generator)** - TBD  
**n8n Workflow #3 (Task Generator)** - TBD

---

## 📥 Workflow #1: Strategy Consultant (AI Breakdown Generator)

### **Complete Workflow Diagram**
```
1. Webhook (Trigger)
   ↓ Receives goal data from Next.js
   │ {goal_id, goal_name, business_unit_id, created_by_user_id, ...}
   ↓
2. HTTP Request (Enrich Data)
   ↓ GET /api/business-units/[id]?creator_id=[user_id]
   │ Fetches: business_unit_description, creator_name, creator_role, role_description
   ↓
3. AI Agent (OpenAI)
   ↓ Prompt with enriched context
   │ Analyzes based on industry, role, and goal type
   ↓
4. Code (Parse Response)
   ↓ Extracts breakdowns array from AI response
   │ Validates and formats for Next.js
   ↓
5. HTTP Request (Send to Next.js)
   ↓ POST /api/webhooks/strategy-breakdown
   │ {goal_id, breakdowns: [{name, value}]}
   ↓
   Database updated + Goal status changed
```

### **Trigger Setup**
1. **Node Type**: Webhook
2. **HTTP Method**: POST
3. **Path**: `hrisnextgen`
4. **Authentication**: None (can be upgraded to Basic Auth later)
5. **Response Mode**: Immediately

### **Expected Payload from Next.js**
```json
{
  "goal_id": "uuid-string",
  "goal_name": "Target 360 Juta Impresi 2026",
  "target_value": "360000000",
  "target_unit": "Impressions",
  "business_unit": "DRW Estetika",
  "business_unit_id": "uuid-business-unit",
  "created_by_user_id": "uuid-user",
  "start_date": "2025-01-01T00:00:00.000Z",
  "end_date": "2026-12-31T23:59:59.999Z",
  "created_at": "2025-10-24T10:30:00.000Z"
}
```

### **Enrich Data from Database (NEW)**
1. **Node Type**: HTTP Request
2. **Purpose**: Fetch business unit details and creator info from Next.js API
3. **Method**: GET
4. **URL**: 
   ```
   http://localhost:3000/api/business-units/{{ $json.business_unit_id }}?include=creator&creator_id={{ $json.created_by_user_id }}
   ```
5. **Authentication**: None

**Alternative: Direct PostgreSQL Query** (if you prefer direct DB access):
1. **Node Type**: Postgres
2. **Operation**: Execute Query
3. **Query**:
   ```sql
   SELECT 
     bu.name as business_unit_name,
     bu.description as business_unit_description,
     u.name as creator_name,
     r.role_name as creator_role,
     r.description as role_description
   FROM business_units bu
   LEFT JOIN users u ON u.user_id = '{{ $json.created_by_user_id }}'
   LEFT JOIN roles r ON u.role_id = r.role_id
   WHERE bu.bu_id = '{{ $json.business_unit_id }}'
   LIMIT 1;
   ```

**Output Example**:
```json
{
  "business_unit_name": "DRW Estetika",
  "business_unit_description": "Brand skincare DRW - Instagram & TikTok",
  "creator_name": "Budi Santoso",
  "creator_role": "Manager",
  "role_description": "Manager yang bertanggung jawab untuk strategi dan approval"
}
```

### **AI Agent Node**
1. **Node Type**: AI Agent
2. **Model**: `gpt-4o` or `gpt-4o-mini` (recommended for speed and cost)
3. **Prompt (User Message)** - Use Expression to inject webhook data AND database enrichment:

```javascript
You are an expert strategic business consultant specializing in goal breakdown and resource allocation across various industries.

CONTEXT:
- Business Unit: {{ $('Webhook').item.json.business_unit }}
- Business Unit Description: {{ $json.business_unit_description || 'N/A' }}
- Goal Creator: {{ $json.creator_name || 'Unknown' }}
- Creator Role: {{ $json.creator_role || 'Unknown' }}
- Role Responsibility: {{ $json.role_description || 'N/A' }}
- Goal Name: {{ $('Webhook').item.json.goal_name }}
- Target Value: {{ $('Webhook').item.json.target_value }} {{ $('Webhook').item.json.target_unit || 'units' }}
- Period: {{ $('Webhook').item.json.start_date }} to {{ $('Webhook').item.json.end_date }}

WHO IS REQUESTING:
This goal is being set by {{ $json.creator_name }} who is a {{ $json.creator_role }} in the {{ $('Webhook').item.json.business_unit }} department.
{{ $json.creator_role }} responsibilities: {{ $json.role_description }}

YOUR TASK:
Analyze this strategic goal and provide intelligent breakdown recommendations based on:
1. The business unit type and its description
2. The role of the person setting this goal (their expertise area)
3. Goal characteristics and industry best practices

ANALYSIS FRAMEWORK:
1. **Industry Detection**: Identify the industry/sector from the Business Unit name and description
2. **Role-Based Context**: Consider the creator's role:
   - If creator is "Manager Digital Marketing" → Focus on digital channels
   - If creator is "Sales Manager" → Focus on sales channels and conversion
   - If creator is "HR Manager" → Focus on recruitment channels
   - If creator is "Operations Manager" → Focus on production/efficiency
   - If creator is "Content Creator" → Focus on content platforms

3. **Goal Type Analysis**: Determine if this is a:
   - Marketing/Visibility goal (impressions, reach, engagement)
   - Sales/Revenue goal (revenue, sales volume, conversions)
   - Operational goal (production, efficiency, customer satisfaction)
   - HR goal (recruitment, training, retention)
   - Other type

4. **Contextual Breakdown**: Based on industry, role, and goal type, recommend:
   - Primary channels/platforms appropriate for this role's expertise
   - Source/Method allocation aligned with role's typical strategies
   - Percentage distribution that sums to 100% for each category

EXAMPLES BY INDUSTRY & ROLE:
- **Skincare Brand + Digital Marketing Manager**: Instagram, TikTok, YouTube, Facebook → Organic vs Paid Ads
- **Skincare Brand + Sales Manager**: E-commerce, Retail Stores, Distributors → Direct vs Channel Sales
- **B2B SaaS + Marketing Manager**: LinkedIn, Email, Content Marketing, Events → Inbound vs Outbound
- **E-commerce + Operations Manager**: Warehouse A/B, Fulfillment Centers → Internal vs 3PL
- **Healthcare Clinic + Marketing Manager**: Walk-in, Online Booking, Referral, Insurance → Direct vs Indirect
- **Manufacturing + Production Manager**: Production Line A/B/C, Outsourcing → Internal vs External
- **Any Company + HR Manager**: Job Boards, LinkedIn, Campus, Referral → Internal vs External Hire

RESPONSE FORMAT (JSON ONLY, NO MARKDOWN):
{
  "breakdowns": [
    {"name": "Primary Channel 1", "value": 40},
    {"name": "Primary Channel 2", "value": 35},
    {"name": "Primary Channel 3", "value": 25},
    {"name": "Source Type 1", "value": 60},
    {"name": "Source Type 2", "value": 40}
  ]
}

RULES:
- Provide 3-5 breakdown items per category
- Percentages must be realistic and sum to 100% within each category
- Use specific, actionable channel names (not generic "Channel 1")
- Consider the creator's role expertise when recommending channels
- Align recommendations with what this role typically manages
- If Business Unit or Role is unclear, default to general business breakdown (Online/Offline, Direct/Indirect)

IMPORTANT: The breakdown should reflect the expertise and typical scope of a {{ $json.creator_role }}.

Return ONLY valid JSON, no explanation text.
```

### **Response Processing**
1. **Node Type**: Code (JavaScript)
2. **Purpose**: Parse AI Agent response and format for Next.js webhook
3. **Code**:

```javascript
// Get the AI Agent response and goal_id from webhook
const aiResponse = $input.first().json;
const goalId = $('Webhook').first().json.goal_id;

// Parse the AI response
let breakdowns;
try {
  // AI Agent might return nested structure, check different possibilities
  if (typeof aiResponse === 'string') {
    // If response is string, parse it
    const parsed = JSON.parse(aiResponse);
    breakdowns = parsed.breakdowns;
  } else if (aiResponse.output) {
    // If using AI Agent node, output might be in 'output' field
    const parsed = JSON.parse(aiResponse.output);
    breakdowns = parsed.breakdowns;
  } else if (aiResponse.breakdowns) {
    // Direct access
    breakdowns = aiResponse.breakdowns;
  } else if (aiResponse.message && aiResponse.message.content) {
    // OpenAI Chat format
    const parsed = JSON.parse(aiResponse.message.content);
    breakdowns = parsed.breakdowns;
  } else {
    // Last resort: try to find breakdowns in the object
    const responseStr = JSON.stringify(aiResponse);
    const match = responseStr.match(/"breakdowns"\s*:\s*(\[.*?\])/);
    if (match) {
      breakdowns = JSON.parse(match[1]);
    } else {
      throw new Error('Could not find breakdowns in AI response');
    }
  }

  // Validate breakdowns
  if (!Array.isArray(breakdowns) || breakdowns.length === 0) {
    throw new Error('Breakdowns is not a valid array or is empty');
  }

  // Format for Next.js webhook
  return [{
    json: {
      goal_id: goalId,
      breakdowns: breakdowns
    }
  }];

} catch (error) {
  // Return error for debugging
  return [{
    json: {
      error: "Failed to parse AI response",
      raw_response: JSON.stringify(aiResponse),
      error_message: error.message,
      goal_id: goalId
    }
  }];
}
```

**Note**: If error occurs, check n8n execution logs to see `raw_response` and adjust parsing logic accordingly.

### **Send to Next.js**
1. **Node Type**: HTTP Request
2. **Method**: POST
3. **URL**: `https://your-nextjs-app.com/api/webhooks/strategy-breakdown`
   - Or for local testing: `http://localhost:3000/api/webhooks/strategy-breakdown`
4. **Authentication**: None (add if needed)
5. **Body**: Use `{{ $json }}` to send the formatted payload

---

## 🧪 Testing Workflow #1

### **Step 1: Create Goal in Next.js**
Go to: `http://localhost:3000/dashboard/goals/create`

Fill form:
- **Goal Name**: "Test Goal - 360M Impressions"
- **Target Value**: "360.000.000"
- **Business Unit**: Select any
- **Role**: Select any
- **Dates**: Any range

Click **"Simpan Semua Goal"**

### **Step 2: Check Next.js Console**
You should see:
```
✅ n8n triggered for goal: [goal_id]
```

### **Step 3: Check n8n Workflow Executions**
1. Go to n8n dashboard
2. Click on "Executions" tab
3. Find the latest execution
4. Verify:
   - ✅ Webhook received payload
   - ✅ OpenAI returned breakdown recommendations
   - ✅ Code node formatted correctly
   - ✅ HTTP Request to Next.js succeeded (200 OK)

### **Step 4: Check Next.js Database**
Query:
```sql
SELECT * FROM proposed_breakdowns WHERE goal_id = '[goal_id]';
```

Expected result:
- Multiple rows with breakdown recommendations
- `status = 'pending_approval'`

### **Step 5: Check Next.js Dashboard**
Go to: `http://localhost:3000/dashboard/goals`

You should see:
- Goal status: **"Awaiting Breakdown Approval"**
- **BreakdownApproval** component showing AI recommendations

---

## 🔧 Troubleshooting

### **Problem: n8n webhook not triggered**
**Cause**: Environment variable not set  
**Solution**:
```bash
# Check .env.local
cat .env.local

# Should contain:
N8N_WORKFLOW_1_WEBHOOK_URL="https://n8n.drwapp.com/webhook/hrisnextgen"
```

### **Problem: OpenAI returns non-JSON response**
**Cause**: Prompt not clear enough  
**Solution**: Update System Message to emphasize "Return ONLY JSON, no markdown, no explanation"

### **Problem: Next.js webhook returns 400 error**
**Cause**: Payload format mismatch  
**Solution**: Check `Code` node output matches:
```json
{
  "goal_id": "uuid",
  "breakdowns": [{"name": "...", "value": 123}]
}
```

### **Problem: Database not updating**
**Cause**: Webhook endpoint error  
**Solution**: Check Next.js logs in terminal running `npm run dev`

---

## 🔐 Security (Optional Enhancements)

### **Add Webhook Authentication**
1. In n8n Webhook node:
   - Set **Authentication**: Basic Auth
   - Username: `n8n_workflow`
   - Password: `[generate strong password]`

2. Update Next.js `/api/goals/route.ts`:
```typescript
await fetch(process.env.N8N_WORKFLOW_1_WEBHOOK_URL, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('n8n_workflow:your-password')
  },
  body: JSON.stringify({...})
});
```

3. Add env variable:
```bash
N8N_WEBHOOK_AUTH="n8n_workflow:your-password"
```

---

## 📊 Monitoring

### **n8n Logs**
- Track execution time (should be < 10 seconds)
- Monitor OpenAI API failures
- Set up error notifications (email/Slack)

### **Next.js Logs**
- Watch for `✅ n8n triggered for goal: [id]`
- Watch for `⚠️ Failed to trigger n8n webhook` errors

---

## 🚀 Next Steps

After Workflow #1 is working:

1. **Workflow #2**: KPI Generation (triggered when breakdowns approved)
2. **Workflow #3**: Daily Task Generation (triggered when KPIs assigned)

Each workflow follows the same pattern:
- Webhook trigger
- OpenAI processing
- Send to Next.js callback webhook
