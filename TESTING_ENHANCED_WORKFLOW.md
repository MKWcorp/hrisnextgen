# Testing Enhanced AI Workflow with Role Context

Dokumentasi testing untuk workflow n8n yang sudah enhanced dengan informasi role dan business unit dari database.

---

## 🎯 What's New?

### **Before (Simple)**:
```json
{
  "business_unit": "DRW Estetika",
  "goal_name": "Target 360M Impressions"
}
```
AI hanya tahu nama business unit.

### **After (Enhanced)**:
```json
{
  "business_unit": "DRW Estetika",
  "business_unit_description": "Brand skincare DRW - Instagram & TikTok",
  "creator_name": "Budi Santoso",
  "creator_role": "Manager",
  "role_description": "Manager yang bertanggung jawab untuk strategi dan approval"
}
```
AI tahu **siapa yang membuat goal** dan **tanggung jawab role-nya**!

---

## 🧪 Test Scenarios

### **Scenario 1: Marketing Manager Creates Goal**

**Setup:**
1. Database seeded dengan user "Budi Santoso" (Manager) di "DRW Estetika"
2. Goal created by Budi Santoso

**Expected AI Behavior:**
- Detects: "Manager" role → Strategic, high-level breakdown
- Business Unit: "DRW Estetika" → Skincare brand
- Result: Instagram, TikTok, YouTube + Organic/Paid mix
- **Reasoning**: Manager fokus pada strategic channels, bukan tactical execution

**Test:**
```bash
# Create goal via dashboard
# Business Unit: DRW Estetika
# Role: Manager (Budi Santoso will be selected)
```

**Expected Breakdown:**
```json
{
  "breakdowns": [
    {"name": "Instagram @drw_official", "value": 40},
    {"name": "TikTok @drw_official", "value": 35},
    {"name": "Facebook", "value": 15},
    {"name": "YouTube", "value": 10},
    {"name": "Organik", "value": 60},
    {"name": "Paid Ads", "value": 40}
  ]
}
```

---

### **Scenario 2: Content Creator Creates Goal**

**Setup:**
1. Add new user "Andi Wijaya" (Content Creator) di "DRW Estetika"
2. Goal created by Andi Wijaya

**Expected AI Behavior:**
- Detects: "Content Creator" role → Platform-specific, content-focused
- Should focus on: TikTok, Instagram Reels (video platforms)
- Less emphasis on: Paid ads (not their responsibility)

**Test:**
```bash
# Create goal via dashboard
# Business Unit: DRW Estetika
# Role: Content Creator
```

**Expected Breakdown:**
```json
{
  "breakdowns": [
    {"name": "TikTok Videos", "value": 45},
    {"name": "Instagram Reels", "value": 35},
    {"name": "Instagram Feed Posts", "value": 15},
    {"name": "YouTube Shorts", "value": 5},
    {"name": "Organic Content", "value": 90},
    {"name": "Boosted Posts", "value": 10}
  ]
}
```

**Difference from Scenario 1:**
- More tactical (specific content types)
- Higher organic % (content creator focuses on organic)
- Platform breakdown more granular (Reels vs Feed vs TikTok)

---

### **Scenario 3: Social Media Manager Creates Goal**

**Setup:**
1. User "Rini Puspita" (Social Media Manager) di "DRW Estetika"
2. Goal created by Rini

**Expected AI Behavior:**
- Detects: "Social Media Manager" role → Community + Engagement focused
- Should include: Engagement strategies, community management
- Balance: Organic content + Paid campaigns

**Test:**
```bash
# Create goal via dashboard
# Business Unit: DRW Estetika
# Role: Social Media Manager
```

**Expected Breakdown:**
```json
{
  "breakdowns": [
    {"name": "Instagram (Feed + Stories + Reels)", "value": 40},
    {"name": "TikTok", "value": 30},
    {"name": "Facebook Community", "value": 20},
    {"name": "Twitter/X Engagement", "value": 10},
    {"name": "Organic + Community Management", "value": 50},
    {"name": "Paid Social Ads", "value": 50}
  ]
}
```

**Difference:**
- More balanced organic/paid (social media managers handle both)
- Includes community platforms (Facebook groups, Twitter)
- Focus on engagement, not just impressions

---

### **Scenario 4: Different Business Unit (Clinic)**

**Setup:**
1. User "Siti Rahma" (Manager) di "DRW Clinic"
2. Goal: "10,000 New Patient Visits"

**Expected AI Behavior:**
- Detects: "Clinic" → Healthcare industry
- Manager role → Strategic allocation
- Result: Patient acquisition channels

**Test:**
```bash
# Create goal via dashboard
# Business Unit: DRW Clinic
# Role: Manager
# Goal: 10,000 Patient Visits
```

**Expected Breakdown:**
```json
{
  "breakdowns": [
    {"name": "Walk-in (Location Marketing)", "value": 30},
    {"name": "Online Booking System", "value": 25},
    {"name": "Referral Program", "value": 25},
    {"name": "Insurance Partnerships", "value": 20},
    {"name": "Direct Marketing", "value": 45},
    {"name": "Partner Channels", "value": 35},
    {"name": "Word of Mouth", "value": 20}
  ]
}
```

**Key Insight**: Same role (Manager) but **different industry** = **different breakdown**!

---

## 📊 Testing Checklist

### **Before Creating Goals:**

1. **Verify Database Seeded:**
   ```bash
   curl http://localhost:3000/api/users
   ```
   Should show 9 users with different roles.

2. **Verify Business Units:**
   ```bash
   curl http://localhost:3000/api/business-units
   ```
   Should show: DRW Estetika, DRW Clinic, Marketing.

3. **Test Enrichment Endpoint:**
   ```bash
   # Get business unit + creator info
   curl "http://localhost:3000/api/business-units/[bu_id]?creator_id=[user_id]"
   ```
   Should return:
   ```json
   {
     "business_unit_name": "DRW Estetika",
     "business_unit_description": "Brand skincare DRW - Instagram & TikTok",
     "creator_name": "Budi Santoso",
     "creator_role": "Manager",
     "role_description": "Manager yang bertanggung jawab untuk strategi dan approval"
   }
   ```

### **During Goal Creation:**

1. **Check Console Log:**
   ```
   ✅ n8n triggered for goal: [goal_id]
   ```

2. **Check n8n Execution:**
   - Node 1 (Webhook): Should receive full payload
   - Node 2 (HTTP Request): Should fetch enrichment data
   - Node 3 (AI Agent): Should use enriched context in prompt
   - Node 4 (Code): Should parse breakdowns
   - Node 5 (HTTP Request): Should POST to Next.js

3. **Check Database:**
   ```sql
   SELECT * FROM proposed_breakdowns WHERE goal_id = '[goal_id]';
   ```

### **Validate AI Context Understanding:**

Check n8n execution logs for AI Agent prompt. It should include:
```
WHO IS REQUESTING:
This goal is being set by [Name] who is a [Role] in the [Business Unit] department.
[Role] responsibilities: [Description]
```

---

## 🔍 Debugging Tips

### **Problem: Enrichment data not showing in AI prompt**

**Check:**
1. HTTP Request node URL is correct
2. API endpoint returns 200 OK
3. Response is properly passed to AI Agent node

**Debug:**
```bash
# Test endpoint manually
curl "http://localhost:3000/api/business-units/[bu_id]?creator_id=[user_id]"
```

### **Problem: AI ignores role context**

**Symptoms:**
- Content Creator gets same breakdown as Manager
- No difference between industries

**Fix:**
1. Check AI Agent prompt includes:
   ```
   Creator Role: {{ $json.creator_role }}
   ```
2. Verify prompt emphasizes:
   ```
   IMPORTANT: The breakdown should reflect the expertise and typical scope of a {{ $json.creator_role }}.
   ```

### **Problem: n8n workflow timeout**

**Cause:** HTTP Request to fetch enrichment data takes too long

**Solution:**
- Set timeout to 10 seconds in HTTP Request node
- Or use fallback: If enrichment fails, continue with basic data

---

## ✅ Success Criteria

### **Test PASSED if:**

1. ✅ **Role-Aware Breakdown**: 
   - Manager gets strategic channels
   - Content Creator gets tactical, content-focused channels
   - Social Media Manager gets engagement-focused mix

2. ✅ **Industry-Aware Breakdown**:
   - Skincare brand gets Instagram/TikTok
   - Clinic gets Walk-in/Online Booking/Referral
   - Different industries = Different channels

3. ✅ **Consistent Quality**:
   - Percentages always sum to 100% per category
   - Channel names are specific (not generic)
   - Realistic allocation (no extreme values like 99% one channel)

4. ✅ **Database Integration**:
   - Enrichment endpoint returns correct data
   - n8n receives enriched context
   - Prompt includes role and business unit description

---

## 📝 Test Results Template

```
Test Date: [Date]
Tester: [Name]

Scenario: [Manager/Content Creator/Social Media Manager]
Business Unit: [DRW Estetika/DRW Clinic/Marketing]
Goal: [Goal Name]

Enrichment Data:
- Business Unit Description: [Yes/No - Correct]
- Creator Name: [Yes/No - Correct]
- Creator Role: [Yes/No - Correct]
- Role Description: [Yes/No - Correct]

AI Breakdown Quality:
- Role-appropriate channels: [Yes/No]
- Industry-appropriate channels: [Yes/No]
- Realistic percentages: [Yes/No]
- Specific channel names: [Yes/No]

Overall: [PASS/FAIL]
Notes: [Any observations]
```

---

## 🚀 Next Steps

After Workflow #1 passes all tests:
1. Implement Workflow #2 (KPI Generation) with similar role context
2. Implement Workflow #3 (Daily Tasks) with role-specific tasks
3. Add analytics to track AI recommendation acceptance rate
