# AI Agent Prompt - Testing Examples

Dokumen ini menunjukkan bagaimana AI Agent akan memberikan breakdown recommendations yang berbeda-beda tergantung **Business Unit** dan **Goal Type**.

---

## 🎨 Example 1: Skincare Brand (Digital Marketing)

### Input:
```json
{
  "business_unit": "DRW Estetika",
  "goal_name": "Target 360 Juta Impresi 2026",
  "target_value": "360000000",
  "target_unit": "Impressions",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31"
}
```

### Expected AI Output:
```json
{
  "breakdowns": [
    {"name": "Instagram @drw_official", "value": 40},
    {"name": "TikTok @drw_official", "value": 35},
    {"name": "Facebook @drw.skincare", "value": 15},
    {"name": "YouTube @drwskincare", "value": 10},
    {"name": "Organik", "value": 60},
    {"name": "Paid Ads", "value": 40}
  ]
}
```

**Reasoning**: 
- Skincare brand → Focus on visual platforms (IG, TikTok)
- Beauty industry trend → TikTok growing fast
- Organic content important for trust building
- Paid ads for reach amplification

---

## 🏥 Example 2: Healthcare/Clinic (Patient Acquisition)

### Input:
```json
{
  "business_unit": "DRW Clinic",
  "goal_name": "Target 10,000 New Patient Visits 2026",
  "target_value": "10000",
  "target_unit": "Patient Visits",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31"
}
```

### Expected AI Output:
```json
{
  "breakdowns": [
    {"name": "Walk-in (Location-based)", "value": 30},
    {"name": "Online Booking (Website/App)", "value": 25},
    {"name": "Referral (Existing Patients)", "value": 25},
    {"name": "Insurance Partners", "value": 20},
    {"name": "Direct Marketing", "value": 45},
    {"name": "Partner Channels", "value": 35},
    {"name": "Word of Mouth", "value": 20}
  ]
}
```

**Reasoning**:
- Clinic → Multiple acquisition channels
- Healthcare → Referrals very important
- Insurance partnerships → Growing channel
- Balance between direct and indirect sources

---

## 💼 Example 3: B2B SaaS (Sales)

### Input:
```json
{
  "business_unit": "Marketing Tech Solutions",
  "goal_name": "Revenue Target $5M ARR",
  "target_value": "5000000",
  "target_unit": "USD",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31"
}
```

### Expected AI Output:
```json
{
  "breakdowns": [
    {"name": "LinkedIn Outreach", "value": 35},
    {"name": "Content Marketing (Blog/SEO)", "value": 25},
    {"name": "Email Campaigns", "value": 20},
    {"name": "Industry Events & Conferences", "value": 15},
    {"name": "Partner Referrals", "value": 5},
    {"name": "Inbound Leads", "value": 55},
    {"name": "Outbound Sales", "value": 45}
  ]
}
```

**Reasoning**:
- B2B → LinkedIn is primary platform
- SaaS → Content marketing for authority
- Events still important for B2B relationships
- Mix of inbound and outbound strategies

---

## 🛒 Example 4: E-commerce (Sales Revenue)

### Input:
```json
{
  "business_unit": "Fashion Online Store",
  "goal_name": "GMV Target 50 Miliar Rupiah",
  "target_value": "50000000000",
  "target_unit": "IDR",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31"
}
```

### Expected AI Output:
```json
{
  "breakdowns": [
    {"name": "Tokopedia", "value": 30},
    {"name": "Shopee", "value": 30},
    {"name": "Own Website", "value": 20},
    {"name": "TikTok Shop", "value": 15},
    {"name": "Instagram Shopping", "value": 5},
    {"name": "Organic Traffic", "value": 40},
    {"name": "Paid Advertising", "value": 45},
    {"name": "Social Commerce", "value": 15}
  ]
}
```

**Reasoning**:
- E-commerce in Indonesia → Marketplace dominance (Tokopedia/Shopee)
- TikTok Shop → Fast-growing channel
- Own website for margin control
- Heavy paid advertising typical in e-commerce

---

## 🏭 Example 5: Manufacturing (Production)

### Input:
```json
{
  "business_unit": "PT Manufaktur Jaya",
  "goal_name": "Production Output 1 Million Units",
  "target_value": "1000000",
  "target_unit": "Units",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31"
}
```

### Expected AI Output:
```json
{
  "breakdowns": [
    {"name": "Production Line A (Main)", "value": 50},
    {"name": "Production Line B (Secondary)", "value": 30},
    {"name": "Outsourcing Partners", "value": 20},
    {"name": "Internal Production", "value": 80},
    {"name": "Third-party Manufacturing", "value": 20}
  ]
}
```

**Reasoning**:
- Manufacturing → Multiple production lines
- Capacity planning → Primary line does most work
- Outsourcing for overflow or specialized items
- 80/20 rule for internal vs external

---

## 👔 Example 6: HR Recruitment

### Input:
```json
{
  "business_unit": "Human Resources",
  "goal_name": "Hire 100 New Employees",
  "target_value": "100",
  "target_unit": "Employees",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31"
}
```

### Expected AI Output:
```json
{
  "breakdowns": [
    {"name": "Job Boards (JobStreet, LinkedIn)", "value": 35},
    {"name": "Campus Recruitment", "value": 25},
    {"name": "Employee Referrals", "value": 20},
    {"name": "Recruitment Agencies", "value": 15},
    {"name": "Social Media Hiring", "value": 5},
    {"name": "Internal Hiring", "value": 20},
    {"name": "External Hiring", "value": 80}
  ]
}
```

**Reasoning**:
- HR → Multiple sourcing channels
- Campus recruitment → Fresh talent
- Referrals → High quality, lower cost
- Agencies for senior/specialized roles
- Majority external hiring typical

---

## 🎯 Key Insights: AI Detects Context

### Detection Patterns:

| Business Unit Pattern | Detected Industry | Typical Channels |
|-----------------------|-------------------|------------------|
| "Estetika", "Beauty", "Skincare" | Beauty/Cosmetics | Instagram, TikTok, Facebook |
| "Clinic", "Hospital", "Healthcare" | Healthcare | Walk-in, Online Booking, Referral |
| "Tech", "SaaS", "Software" | B2B Technology | LinkedIn, Email, Content Marketing |
| "Fashion", "Store", "Shop" | E-commerce/Retail | Marketplace, Website, Social Commerce |
| "Manufaktur", "Production", "Factory" | Manufacturing | Production Lines, Outsourcing |
| "HR", "Human Resources", "Recruitment" | Human Resources | Job Boards, Campus, Referrals |
| Generic/Unknown | General Business | Online/Offline, Direct/Indirect |

### Goal Type Patterns:

| Goal Keyword | Detected Type | Typical Breakdown |
|--------------|---------------|-------------------|
| "Impresi", "Reach", "Engagement" | Marketing Visibility | Platforms + Organic/Paid |
| "Revenue", "Sales", "GMV" | Sales/Financial | Channels + Direct/Indirect |
| "Production", "Units", "Output" | Operations | Lines/Departments + Internal/External |
| "Hire", "Employees", "Recruitment" | HR | Sources + Internal/External |
| "Customers", "Visits", "Patients" | Customer Acquisition | Channels + Acquisition Method |

---

## 🧪 Testing Your n8n Workflow

### Test Case 1: Digital Marketing (Base Case)
```bash
curl -X POST https://n8n.drwapp.com/webhook/hrisnextgen \
  -H "Content-Type: application/json" \
  -d '{
    "goal_id": "test-123",
    "business_unit": "DRW Estetika",
    "goal_name": "Target 360M Impressions",
    "target_value": "360000000",
    "target_unit": "Impressions"
  }'
```

### Test Case 2: Healthcare
```bash
curl -X POST https://n8n.drwapp.com/webhook/hrisnextgen \
  -H "Content-Type: application/json" \
  -d '{
    "goal_id": "test-456",
    "business_unit": "DRW Clinic",
    "goal_name": "10K Patient Visits",
    "target_value": "10000",
    "target_unit": "Visits"
  }'
```

### Test Case 3: Generic Business (Fallback Test)
```bash
curl -X POST https://n8n.drwapp.com/webhook/hrisnextgen \
  -H "Content-Type: application/json" \
  -d '{
    "goal_id": "test-789",
    "business_unit": "General Business",
    "goal_name": "Annual Target",
    "target_value": "1000000",
    "target_unit": "Units"
  }'
```

**Expected**: AI should default to generic breakdown like "Online/Offline" + "Direct/Indirect"

---

## 📝 Prompt Quality Tips

### ✅ Good Practices:
1. **Clear Context**: Business Unit name should be descriptive
2. **Specific Goals**: Include unit of measurement
3. **Industry Keywords**: Use terms AI can recognize
4. **Realistic Targets**: Help AI understand scale

### ❌ Avoid:
1. Vague Business Unit names ("Department A", "Team 1")
2. Missing target units
3. Unrealistic numbers that confuse AI
4. Mixed languages in single field (use consistent ID/EN)

---

## 🚀 Advanced: Multi-Language Support

AI can handle:
- **Indonesian**: "Klinik", "Estetika", "Produksi"
- **English**: "Clinic", "Beauty", "Manufacturing"
- **Mixed**: "DRW Estetika (Skincare Brand)"

Prompt is designed to understand context regardless of language!
