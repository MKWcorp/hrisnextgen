# n8n Workflow #2: KPI Breakdown Generator

## 🎯 Purpose
Generate detailed KPI recommendations after user reviews and approves strategic goals.

---

## 📋 Workflow Structure

```
Node 1: Webhook (Receive batch_id)
   ↓
Node 2: HTTP Request (Fetch batch data from Next.js)
   ↓
Node 3: AI Agent (Generate KPI breakdown)
   ↓
Node 4: Code (Parse & Format)
   ↓
Node 5: HTTP Request (Save KPIs to Next.js)
   ↓
Node 6: Respond to Webhook
```

---

## 🔧 Node Configuration

### **Node 1: Webhook**
- **Type**: Webhook
- **Path**: `hrisnextgen-kpi-breakdown`
- **Method**: POST
- **Response Mode**: When Last Node Finishes
- **Authentication**: None

**Expected Input**:
```json
{
  "batch_id": "46d20cf0-a15a-406c-9052-793f59fc7f73"
}
```

---

### **Node 2: HTTP Request - Fetch Batch Data**
- **Type**: HTTP Request
- **Method**: GET
- **URL**: `http://localhost:3000/api/review/{{ $json.batch_id }}`
  - **Production**: `https://your-domain.com/api/review/{{ $json.batch_id }}`
- **Authentication**: None
- **Response Format**: JSON

**Purpose**: Get complete batch data including:
- Strategic goals
- Approved role recommendations
- Approved breakdowns
- Managed assets

---

### **Node 3: AI Agent - Generate KPI Breakdown**
- **Type**: AI Agent (OpenAI/Anthropic)
- **Model**: `gpt-4` or `gpt-3.5-turbo`
- **Temperature**: 0.3
- **Max Tokens**: 2000

**System Prompt**:
```
You are a strategic KPI expert specializing in performance management systems. 
Your task is to analyze approved strategic goals and breakdowns, then generate detailed, measurable KPIs for each recommended role.
```

**User Message** (use Expression):
```
Analyze the following strategic goals and generate detailed KPIs:

BUSINESS CONTEXT:
- Business Unit: {{ $json.business_unit_name }}
- Batch Name: {{ $json.batch_name }}
- Goals Count: {{ $json.goals.length }}

STRATEGIC GOALS:
{{ $json.goals.map((goal, i) => `
Goal ${i+1}: ${goal.goal_name}
- Target: ${goal.target_value} ${goal.target_unit}
- Timeline: ${goal.start_date} to ${goal.end_date}
`).join('\n') }}

APPROVED ROLE RECOMMENDATIONS:
{{ $json.ai_recommended_roles.map((role, i) => `
Role ${i+1}: ${role.role_name}
- Responsibility: ${role.responsibility}
- Rationale: ${role.rationale}
`).join('\n') }}

APPROVED BREAKDOWNS:
{{ $json.proposed_breakdowns.map((bd, i) => `
${bd.name}: ${bd.value}${bd.unit || '%'}
`).join('\n') }}

MANAGED ASSETS:
{{ $json.batch_managed_assets.map((asset, i) => `
- ${asset.asset_name}: ${asset.metric_value} ${asset.metric_unit}
`).join('\n') }}

YOUR TASK:
Generate specific, measurable KPIs for each role. For each KPI:
1. Link to a specific role from the approved list
2. Provide clear, actionable description
3. Set monthly target (if applicable)
4. Specify platform/channel (if applicable)
5. Specify source (Organic/Paid/etc)
6. Provide rationale

RESPONSE FORMAT (JSON ONLY):
{
  "kpis": [
    {
      "role_name": "Content Creator",
      "kpi_description": "Generate 15M organic impressions monthly on Instagram",
      "target_bulanan": 15000000,
      "platform": "Instagram",
      "source": "Organic",
      "rationale": "Based on 40% Instagram allocation of 360M annual target"
    },
    {
      "role_name": "Social Media Manager",
      "kpi_description": "Increase follower growth rate by 5% monthly",
      "target_bulanan": null,
      "platform": "All Platforms",
      "source": null,
      "rationale": "Oversee overall social media strategy and growth"
    }
  ]
}

RULES:
- Generate 3-7 KPIs total
- Each role should have at least 1 KPI
- KPIs must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Use null for target_bulanan if not applicable
- Base recommendations on approved breakdowns and assets
- Return ONLY valid JSON, no markdown, no explanation
```

---

### **Node 4: Code - Parse AI Response**
- **Type**: Code (JavaScript)
- **Purpose**: Parse AI output and format for Next.js webhook

**Code**:
```javascript
// Get AI Agent output
const aiOutput = $input.first().json;
const batchId = $('Webhook').first().json.batch_id;

// Parse AI response
let kpis;
try {
  // Check different possible response structures
  if (typeof aiOutput === 'string') {
    const parsed = JSON.parse(aiOutput);
    kpis = parsed.kpis;
  } else if (aiOutput.output) {
    // If using AI Agent node, output might be in 'output' field
    if (typeof aiOutput.output === 'string') {
      const parsed = JSON.parse(aiOutput.output);
      kpis = parsed.kpis;
    } else {
      kpis = aiOutput.output.kpis;
    }
  } else if (aiOutput.kpis) {
    // Direct structure
    kpis = aiOutput.kpis;
  } else {
    throw new Error('Unable to find kpis in AI response');
  }

  // Validate KPIs structure
  if (!Array.isArray(kpis) || kpis.length === 0) {
    throw new Error('KPIs is not a valid array or is empty');
  }

  // Format for Next.js webhook
  return [{
    json: {
      batch_id: batchId,
      kpis: kpis.map(kpi => ({
        role_name: kpi.role_name,
        kpi_description: kpi.kpi_description,
        target_bulanan: kpi.target_bulanan,
        platform: kpi.platform || null,
        source: kpi.source || null,
        rationale: kpi.rationale || null,
      }))
    }
  }];

} catch (error) {
  // Return error for debugging
  return [{
    json: {
      error: "Failed to parse AI response",
      raw_response: JSON.stringify(aiOutput),
      error_message: error.message,
      batch_id: batchId
    }
  }];
}
```

---

### **Node 5: HTTP Request - Save to Next.js**
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `http://localhost:3000/api/webhooks/kpi-generation`
  - **Production**: `https://your-domain.com/api/webhooks/kpi-generation`
- **Body**: `{{ $json }}`
- **Authentication**: None
- **Response Format**: JSON

**Purpose**: Send generated KPIs back to Next.js to save in database

---

### **Node 6: Respond to Webhook**
- **Type**: Respond to Webhook
- **Respond With**: JSON

**Response Body**:
```json
{
  "success": true,
  "message": "KPI breakdown generated successfully",
  "batch_id": "{{ $('Webhook').item.json.batch_id }}",
  "kpis_generated": {{ $('Code').item.json.kpis?.length || 0 }}
}
```

---

## 🧪 Testing

### 1. Test with cURL
```bash
curl -X POST https://n8n.drwapp.com/webhook/hrisnextgen-kpi-breakdown \
  -H "Content-Type: application/json" \
  -d '{"batch_id": "your-test-batch-id"}'
```

### 2. Test from Next.js UI
1. Go to `/dashboard`
2. Click a review batch
3. Edit and save data
4. Click **🤖 Rekomendasi AI** button
5. Check console logs

### 3. Verify n8n Execution
1. Go to n8n dashboard
2. Click "Executions" tab
3. Find latest execution
4. Verify all nodes succeeded

---

## ✅ Success Indicators

- ✅ Webhook receives batch_id
- ✅ HTTP Request fetches batch data (status 200)
- ✅ AI Agent returns valid JSON with KPIs
- ✅ Code node parses successfully
- ✅ HTTP Request saves to Next.js (status 200/201)
- ✅ Database has new records in `proposed_kpis`

---

## ❌ Troubleshooting

### Error: "Workflow not registered"
**Solution**: Activate the workflow (toggle in top-right corner)

### Error: "Cannot read property 'batch_id'"
**Solution**: Check webhook payload includes `batch_id` field

### Error: "AI returned invalid JSON"
**Solution**: 
1. Check AI Agent output in execution log
2. Update system prompt to emphasize JSON-only response
3. Increase max tokens if response was truncated

### Error: "HTTP Request failed: 404"
**Solution**: Update URLs to match your environment (localhost vs production)

---

## 🚀 Activation Steps

1. **Create workflow** in n8n dashboard
2. **Add all 6 nodes** as configured above
3. **Connect nodes** in sequence
4. **Test with dummy data** first
5. **Toggle workflow to ACTIVE** ✅
6. **Copy production webhook URL**
7. **Update `.env`** if URL changed
8. **Restart Next.js dev server**

---

## 📝 Notes

- This workflow is triggered MANUALLY by user clicking "🤖 Rekomendasi AI" button
- It does NOT run automatically on save (that was removed for performance)
- User must save data first before clicking AI button
- Workflow should complete in 5-15 seconds
- Frontend polls for updates every 5 seconds
- Timeout after 2 minutes with manual refresh prompt
