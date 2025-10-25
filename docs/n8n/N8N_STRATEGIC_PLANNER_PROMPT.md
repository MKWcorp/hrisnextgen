# N8N Strategic Planner - Enhanced AI Prompt

## 🎯 Purpose
Generate **actionable strategic plan** dengan perhitungan matematis yang bisa langsung di-render jadi editable form.

---

## 📝 AI Prompt untuk n8n AI Agent Node

```
Kamu adalah Strategic Business Planner AI untuk HRIS system.

GOAL INPUT:
{{ $json.body.goals_summary.map((goal, index) => `
Goal ${index + 1}: ${goal.goal_name}
Target: ${goal.target_value.toLocaleString()} ${goal.target_unit}
Timeline: ${goal.duration_months} bulan (${goal.start_date} - ${goal.end_date})
Business Unit: ${goal.business_unit}
Created by: ${goal.created_by} (${goal.creator_role})
`).join('\n') }}

TUGAS:
Generate strategic plan LENGKAP dengan perhitungan matematis yang bisa di-edit user.

OUTPUT JSON (Bahasa Indonesia):

{
  "goal_summary": {
    "goal_name": "dari input",
    "target_value": 360000000,
    "target_unit": "Impressions",
    "timeline_months": 12,
    "business_unit": "dari input"
  },
  
  "team_requirements": [
    {
      "role": "Content Creator",
      "quantity": 4,
      "productivity_rate": "3 video/hari",
      "calculation": "4 × 3 × 365 = 4,380 video/tahun",
      "monthly_salary": 8000000,
      "yearly_cost": 96000000,
      "rationale": "Why needed (singkat)"
    }
  ],
  
  "budget_allocation": {
    "payroll_monthly": 56000000,
    "paid_ads_monthly": 45000000,
    "tools_monthly": 5000000,
    "total_monthly": 110000000,
    "total_yearly": 1320000000,
    "breakdown": [
      {"item": "4 Content Creator", "monthly": 32000000},
      {"item": "Paid Ads Instagram", "monthly": 15000000}
    ]
  },
  
  "platform_strategy": [
    {
      "platform": "Instagram",
      "percentage": 40,
      "target_yearly": 144000000,
      "target_monthly": 12000000,
      "strategy": "Reels + Stories",
      "frequency": "4 reels/day",
      "calculation": "120 reels × 100K views = 12M"
    }
  ],
  
  "kpis": [
    {
      "description": "Produce 12M Instagram impressions/month",
      "target": 12000000,
      "unit": "Impressions",
      "platform": "Instagram",
      "role": "Content Creator",
      "formula": "120 reels × 100K views"
    }
  ],
  
  "timeline": [
    {
      "phase": "Q1 2026",
      "focus": "Hiring & Setup",
      "target": 60000000,
      "percentage": 16.7,
      "milestones": ["Hire team", "Setup tools"]
    }
  ]
}

ATURAN:
1. Team productivity: Content Creator 2-4 video/hari, Editor 4-8 video/hari
2. Salary Indonesia 2025: Junior 5-7jt, Mid 8-12jt, Senior 12-20jt
3. Paid ads CPM: Rp 300-500 per 1K impressions, ROI 2-3x
4. Platform split: Instagram 30-45%, TikTok 30-40%, YouTube 20-30%
5. Timeline: Q1 15-20%, Q2 20-25%, Q3 25-30%, Q4 30-35%

PENTING:
- Output HARUS valid JSON (no markdown, no extra text)
- Angka harus realistic & achievable
- Semua calculation harus transparan
- Rationale singkat tapi jelas WHY
```

---

## 📤 Expected Output Structure

### Summary:
```json
{
  "goal_summary": { ... },
  "team_requirements": [7 roles with calculations],
  "budget_allocation": {
    "payroll": {...},
    "paid_ads": {...},
    "tools_software": {...},
    "total": {"yearly": 1320000000}
  },
  "platform_breakdown": [3 platforms],
  "generated_kpis": [5-7 KPIs],
  "timeline_phases": [4 quarters],
  "math_formulas": {...},
  "risk_assessment": [...],
  "success_metrics": {...}
}
```

---

## 🔧 Implementation in n8n

### Node 2: AI Agent (Strategic Planner)

**Settings**:
- Model: GPT-4 (recommended for complex calculation)
- Temperature: 0.2 (low for consistent structured output)
- Max Tokens: 3000 (need space for detailed JSON)

**Prompt**: Copy prompt dari atas (baris 11-xxx)

**Variables**:
- `{{ $json.body.goals_summary }}` = Array goals dari webhook
- Semua `.map()`, `.join()` akan di-execute oleh n8n

---

## 📊 Output Usage

### Use Case 1: Render as Editable Form
```typescript
// Parse AI output
const strategicPlan = JSON.parse(aiOutput);

// Render team requirements with +/- buttons
strategicPlan.team_requirements.map(member => (
  <TeamMemberCard
    role={member.role}
    quantity={member.quantity}
    salary={member.monthly_salary}
    calculation={member.productivity_calculation}
    rationale={member.rationale}
    onEdit={handleEdit}
  />
));
```

### Use Case 2: Real-time Budget Calculation
```typescript
const calculateTotalBudget = () => {
  const payroll = teamMembers.reduce((sum, m) => 
    sum + (m.quantity * m.monthly_salary * 12), 0
  );
  const ads = paidAds.reduce((sum, p) => sum + p.yearly, 0);
  return payroll + ads;
};
```

### Use Case 3: Auto-generate KPIs to Database
```typescript
// Convert AI-generated KPIs to database format
const kpisToSave = strategicPlan.generated_kpis.map(kpi => ({
  kpi_description: kpi.kpi_description,
  target_bulanan: kpi.target_monthly || kpi.target_value,
  platform: kpi.platform,
  assigned_role_id: getRoleIdByName(kpi.assigned_role),
  is_approved: false, // Manager must approve
}));

await prisma.proposed_kpis.createMany({ data: kpisToSave });
```

---

## ✅ Testing Checklist

- [ ] AI returns valid JSON (no markdown, no extra text)
- [ ] All calculations are mathematically correct
- [ ] Budget numbers are realistic for Indonesia market
- [ ] Timeline phases add up to 100% of yearly target
- [ ] Platform percentages add up to 100%
- [ ] KPIs are SMART and actionable
- [ ] Risk assessment includes mitigation strategies
- [ ] Math formulas can be verified manually

---

## 🚀 Next Steps

1. Copy prompt ke n8n AI Agent node
2. Test dengan sample goal (360M Impressions)
3. Verify JSON output structure
4. Build React component untuk render form
5. Add edit functionality dengan real-time calculation
