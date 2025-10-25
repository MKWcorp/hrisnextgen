# N8N Portfolio Analysis Workflow

## 🎯 Tujuan
Workflow ini menganalisa **semua strategic goals** yang sudah dibuat dan memberikan rekomendasi AI berdasarkan:
- Goal overlap/konflik
- Resource allocation suggestions
- Priority recommendations
- Gap analysis (missing coverage)
- Timeline conflicts
- Team capacity analysis

---

## 🔄 Workflow Architecture

### Node 1: Webhook Trigger
- **Name**: "Webhook - Receive Analysis Request"
- **Path**: `/webhook/hrisnextgen-analyze`
- **Method**: POST
- **Authentication**: None (atau Header Auth jika production)

**Expected Payload**:
```json
{
  "analysis_type": "portfolio_review",
  "total_goals": 2,
  "goals_summary": [
    {
      "goal_id": "uuid",
      "goal_name": "360 Juta Impresi",
      "target_value": "360000000",
      "target_unit": "Impressi",
      "status": "Pending",
      "business_unit": "DRW Estetika",
      "business_unit_description": "Skincare & beauty products",
      "created_by": "Andi Wijaya",
      "creator_role": "Content Creator",
      "start_date": "2025-10-24T00:00:00.000Z",
      "end_date": "2026-10-24T00:00:00.000Z",
      "kpi_count": 0,
      "kpi_approved": 0
    },
    {
      "goal_id": "uuid-2",
      "goal_name": "1 Juta Follower",
      "target_value": "1000000",
      "target_unit": "Follower",
      "status": "Pending",
      "business_unit": "DRW Estetika",
      "business_unit_description": "Skincare & beauty products",
      "created_by": "Andi Wijaya",
      "creator_role": "Content Creator",
      "start_date": "2025-10-24T00:00:00.000Z",
      "end_date": "2026-10-24T00:00:00.000Z",
      "kpi_count": 0,
      "kpi_approved": 0
    }
  ],
  "analysis_request": {
    "requested_at": "2025-10-25T10:30:00.000Z",
    "analysis_areas": [
      "goal_overlap",
      "resource_allocation",
      "priority_recommendations",
      "gap_analysis",
      "timeline_conflicts",
      "team_capacity"
    ]
  }
}
```

---

### Node 2: AI Agent - Portfolio Analyst
- **Name**: "AI Agent - Portfolio Analyst"
- **Type**: AI Agent (bukan OpenAI Chat Model)
- **Requires Prompt Only**: Yes

**AI Agent Prompt**:
```
You are a Strategic Portfolio Analyst specializing in performance management and goal setting.

You have been provided with a complete overview of ALL strategic goals currently set by the organization:

{{$json.goals_summary}}

Total Goals: {{$json.total_goals}}
Analysis Type: {{$json.analysis_type}}

Your task is to perform a comprehensive portfolio analysis and provide actionable recommendations. Analyze the following areas:

1. **Goal Overlap & Conflicts**
   - Are there goals that target the same metrics or resources?
   - Do any goals contradict each other?
   - Which goals have synergies that should be leveraged?

2. **Resource Allocation**
   - Based on the business units and roles involved, is the workload balanced?
   - Are there teams/roles that are overcommitted or underutilized?
   - Suggest optimal resource distribution

3. **Priority Recommendations**
   - Which goals should be prioritized based on business impact and timeline?
   - Suggest a recommended execution order (which goals to focus on first)
   - Identify quick wins vs long-term investments

4. **Gap Analysis**
   - What important areas are NOT covered by current goals?
   - Are there missing metrics or business units without goals?
   - Suggest additional goals that should be considered

5. **Timeline Conflicts**
   - Are there goals with unrealistic timelines given the team capacity?
   - Do any goals have overlapping critical phases?
   - Suggest timeline adjustments if needed

6. **Team Capacity Analysis**
   - Based on creator roles and business units, is the team capacity sufficient?
   - Which roles need additional support or hiring?
   - Are there bottlenecks in specific teams?

**IMPORTANT CONTEXT RULES**:
- If goals are from the same business unit, consider their combined impact
- If goals are created by the same role, consider their capacity and expertise
- Look for patterns across different goal types (Impressions, Followers, Revenue, etc.)
- Consider industry-specific best practices for each business unit

**OUTPUT FORMAT**:
Return your analysis as a structured JSON object with the following format:

{
  "executive_summary": "Brief 2-3 sentence overview of the portfolio health",
  "portfolio_score": 75,
  "portfolio_health": "Good",
  "key_insights": [
    "Insight 1: Brief description",
    "Insight 2: Brief description",
    "Insight 3: Brief description"
  ],
  "recommendations": {
    "goal_overlap": {
      "status": "No Conflicts" | "Minor Conflicts" | "Major Conflicts",
      "details": ["Finding 1", "Finding 2"],
      "action_items": ["Action 1", "Action 2"]
    },
    "resource_allocation": {
      "status": "Balanced" | "Underutilized" | "Overcommitted",
      "details": ["Finding 1", "Finding 2"],
      "action_items": ["Action 1", "Action 2"]
    },
    "priority_recommendations": {
      "high_priority": ["Goal Name 1", "Goal Name 2"],
      "medium_priority": ["Goal Name 3"],
      "low_priority": [],
      "rationale": "Why this prioritization"
    },
    "gap_analysis": {
      "missing_areas": ["Area 1", "Area 2"],
      "suggested_goals": [
        {
          "suggested_goal_name": "Example Goal",
          "rationale": "Why this is needed",
          "business_unit": "Which BU should own it"
        }
      ]
    },
    "timeline_conflicts": {
      "status": "No Conflicts" | "Minor Conflicts" | "Major Conflicts",
      "conflicts": ["Conflict description"],
      "adjustments": ["Suggested adjustment"]
    },
    "team_capacity": {
      "status": "Sufficient" | "Stretched" | "Overloaded",
      "bottlenecks": ["Bottleneck 1"],
      "hiring_needs": ["Role 1", "Role 2"]
    }
  },
  "next_steps": [
    "Next step 1",
    "Next step 2",
    "Next step 3"
  ]
}

Be specific, data-driven, and actionable. Reference specific goals by name when making recommendations.
```

---

### Node 3: Code - Parse AI Response
- **Name**: "Code - Parse Analysis JSON"
- **Type**: Code (JavaScript)
- **Purpose**: Extract and validate AI response

```javascript
// Get AI response
const aiResponse = $input.first().json;

// Try to parse if it's a string
let analysisResult;
if (typeof aiResponse === 'string') {
  try {
    analysisResult = JSON.parse(aiResponse);
  } catch (error) {
    analysisResult = {
      error: "Failed to parse AI response",
      raw_response: aiResponse
    };
  }
} else {
  analysisResult = aiResponse;
}

// Add metadata
analysisResult.analyzed_at = new Date().toISOString();
analysisResult.analysis_id = `ANALYSIS_${Date.now()}`;

return {
  json: analysisResult
};
```

---

### Node 4: HTTP Request - Save to Database (Optional)
- **Name**: "HTTP Request - Save Analysis Result"
- **Type**: HTTP Request
- **URL**: `http://your-nextjs-domain/api/analysis/save`
- **Method**: POST
- **Body**: `{{$json}}`

**Purpose**: Save analysis results ke database untuk history tracking

---

### Node 5: HTTP Request - Send Notification (Optional)
- **Name**: "HTTP Request - Notify Manager"
- **Type**: HTTP Request
- **URL**: `http://your-nextjs-domain/api/notifications/analysis-complete`
- **Method**: POST
- **Body**:
```json
{
  "analysis_id": "{{$json.analysis_id}}",
  "portfolio_score": "{{$json.portfolio_score}}",
  "executive_summary": "{{$json.executive_summary}}"
}
```

---

## 📊 Example AI Response

```json
{
  "executive_summary": "Portfolio shows strong focus on digital marketing metrics with 2 synergistic goals for DRW Estetika. Both goals are aligned but may strain Content Creator capacity.",
  "portfolio_score": 78,
  "portfolio_health": "Good",
  "key_insights": [
    "Both goals target social media growth for the same brand, creating strong synergy",
    "Goals share the same timeline (1 year) and creator, which may cause capacity issues",
    "Missing goals for customer retention, conversion rate, and revenue targets"
  ],
  "recommendations": {
    "goal_overlap": {
      "status": "Minor Conflicts",
      "details": [
        "Both '360 Juta Impresi' and '1 Juta Follower' rely heavily on social media content creation",
        "Goals are complementary (impressions drive follower growth) but compete for same resources"
      ],
      "action_items": [
        "Consider staggering execution: focus on impressions Q1-Q2, then shift to follower growth Q3-Q4",
        "Hire additional Content Creator to support both goals simultaneously"
      ]
    },
    "resource_allocation": {
      "status": "Overcommitted",
      "details": [
        "Andi Wijaya (Content Creator) is assigned as creator for both major goals",
        "360M impressions + 1M followers requires approximately 15-20 content pieces per week",
        "Current capacity estimate: 8-10 pieces per week for single creator"
      ],
      "action_items": [
        "Hire 1 additional Content Creator for DRW Estetika",
        "Consider outsourcing content production for non-core platforms",
        "Implement content batching and automation tools"
      ]
    },
    "priority_recommendations": {
      "high_priority": ["360 Juta Impresi"],
      "medium_priority": ["1 Juta Follower"],
      "low_priority": [],
      "rationale": "Impressions goal should come first as it builds brand awareness and naturally leads to follower growth. Once impression momentum is established (Q2), shift focus to follower conversion optimization."
    },
    "gap_analysis": {
      "missing_areas": [
        "Customer retention & engagement metrics",
        "Revenue/Sales conversion goals",
        "Product launch targets",
        "Customer satisfaction (NPS/CSAT)"
      ],
      "suggested_goals": [
        {
          "suggested_goal_name": "Increase Repeat Purchase Rate to 35%",
          "rationale": "High impressions and followers mean nothing without sales. Focus on converting awareness to revenue.",
          "business_unit": "DRW Estetika"
        },
        {
          "suggested_goal_name": "Achieve Average Order Value of Rp 450.000",
          "rationale": "Optimize revenue per customer to maximize marketing ROI",
          "business_unit": "DRW Estetika"
        },
        {
          "suggested_goal_name": "Launch 3 New Product Lines with 10K Units Sold Each",
          "rationale": "Expand product portfolio to capitalize on growing audience",
          "business_unit": "DRW Estetika"
        }
      ]
    },
    "timeline_conflicts": {
      "status": "Minor Conflicts",
      "conflicts": [
        "Both goals run parallel for 1 year (Oct 2025 - Oct 2026) with same creator"
      ],
      "adjustments": [
        "Phase 1 (Oct 2025 - Mar 2026): Focus 70% effort on impressions, 30% on followers",
        "Phase 2 (Apr 2026 - Oct 2026): Shift to 40% impressions, 60% followers"
      ]
    },
    "team_capacity": {
      "status": "Stretched",
      "bottlenecks": [
        "Content Creator role is single point of failure for both goals",
        "No backup or secondary content producers identified"
      ],
      "hiring_needs": [
        "1x Content Creator (focus on short-form video: Reels, TikTok)",
        "1x Social Media Manager (to coordinate content strategy and analytics)",
        "1x Graphic Designer (to support visual content creation)"
      ]
    }
  },
  "next_steps": [
    "Approve current goals and proceed with AI breakdown",
    "Initiate hiring process for Content Creator and Social Media Manager",
    "Add revenue and retention goals to balance portfolio",
    "Set up monthly portfolio review meetings to track progress"
  ]
}
```

---

## 🚀 Setup Instructions

### 1. Create Webhook in n8n
- Create new workflow: "Portfolio Analysis"
- Add Webhook node with path: `/webhook/hrisnextgen-analyze`
- Copy webhook URL to `.env.local`: `N8N_WORKFLOW_ANALYSIS_WEBHOOK_URL`

### 2. Add AI Agent Node
- Connect to Webhook
- Paste the AI Agent prompt
- Configure AI model (recommend: GPT-4 or Claude for complex analysis)

### 3. Add Code Node
- Connect to AI Agent
- Paste the JavaScript parsing code

### 4. Test Workflow
- From Next.js: Click "🤖 Rekomendasi AI" button
- Check n8n execution log
- Verify AI response format

### 5. (Optional) Save Results to Database
- Create table: `goal_analysis_results`
- Add HTTP Request node to save
- Update Next.js to display analysis history

---

## 📝 Database Table for Analysis History (Optional)

```sql
CREATE TABLE goal_analysis_results (
  analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analyzed_at TIMESTAMP DEFAULT NOW(),
  total_goals_analyzed INT NOT NULL,
  portfolio_score INT,
  portfolio_health VARCHAR(50),
  executive_summary TEXT,
  recommendations JSONB,
  next_steps JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 Usage Flow

1. **Manager** masuk ke `/dashboard/goals`
2. Klik tombol **"🤖 Rekomendasi AI"**
3. Next.js trigger `/api/goals/analyze`
4. API fetch all goals from database
5. API send payload to n8n webhook
6. n8n → AI Agent analyzes portfolio
7. AI returns comprehensive recommendations
8. (Optional) Save to database for history
9. (Optional) Send email notification to manager

---

## 💡 Use Cases

### Use Case 1: Portfolio Health Check
Manager clicks "Rekomendasi AI" weekly to get portfolio health score and identify issues early.

### Use Case 2: New Goal Validation
Before creating new goal, manager checks analysis to see if it fills a gap or creates conflict.

### Use Case 3: Resource Planning
HR uses analysis to identify hiring needs based on goal capacity analysis.

### Use Case 4: Quarterly Review
Leadership reviews analysis recommendations during quarterly strategy meetings.

---

## 🔧 Configuration

Update `.env.local`:
```bash
N8N_WORKFLOW_ANALYSIS_WEBHOOK_URL="https://n8n.drwapp.com/webhook/hrisnextgen-analyze"
```

---

## ✅ Checklist

- [ ] Create n8n workflow with 5 nodes
- [ ] Configure webhook URL in `.env.local`
- [ ] Test with 2+ goals in database
- [ ] Verify AI response format
- [ ] (Optional) Create database table for history
- [ ] (Optional) Add email notification
- [ ] Test "Rekomendasi AI" button in UI

---

## 📊 Future Enhancements

1. **Real-time Analysis Dashboard**: Display analysis results in UI
2. **Scheduled Analysis**: Auto-run analysis weekly
3. **Comparison View**: Compare current analysis vs previous
4. **Export Reports**: Generate PDF reports from analysis
5. **Team Notifications**: Notify relevant stakeholders of recommendations
