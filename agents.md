# Agents Documentation - HRIS Next Gen

This document describes the AI agents and automation workflows that power the HRIS Next Gen performance management system.

## 🎯 Project Overview

**Mission**: Transform high-level strategic goals (e.g., "360 Million Impressions") into actionable daily checklists for employees using AI-powered automation.

**Tech Stack**:
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- Backend: Prisma ORM + PostgreSQL
- Automation & AI: n8n workflows

---

## 🔄 The 6-Step Workflow

### Step 1: Manager Input → Strategic Goals
**Actor**: Manager (via Next.js Dashboard)  
**Action**: Creates a strategic goal using GoalForm  
**Database**: Writes to `strategic_goals` table  
**Data**:
- `goal_name` (e.g., "Target 360 Juta Impresi 2026")
- `target_value` (e.g., 360000000)
- `target_unit` (e.g., "Impressions")
- `business_unit_id`
- `created_by_user_id`
- `start_date` & `end_date`

**Status**: `Pending`

---

### Step 2: AI Strategy Consultant → Breakdown Recommendations
**Actor**: n8n Workflow #1 (AI Agent)  
**Trigger**: Webhook called immediately after goal creation (real-time)
**Webhook URL**: `https://n8n.drwapp.com/webhook/hrisnextgen`
**AI Role**: "Strategic Consultant"  
**Action**: AI analyzes the goal and recommends strategic breakdown (e.g., platform allocation, source allocation)  
**Database**: Writes to `proposed_breakdowns` table  
**Data**:
- `breakdown_id` (UUID)
- `goal_id` (FK to strategic_goals)
- `name` (e.g., "Instagram", "TikTok", "Organik", "Paid Ads")
- `value` (e.g., percentage or absolute value)
- `status` (default: `pending_approval`)

**Integration Flow**:
1. Next.js `/api/goals` creates goal with `status = 'Pending'`
2. Next.js immediately calls n8n webhook with goal data as JSON
3. n8n receives webhook, processes with OpenAI
4. n8n POSTs result to `/api/webhooks/strategy-breakdown`
5. Next.js updates `proposed_breakdowns` and changes goal `status` to `'Awaiting Breakdown Approval'`

**Webhook Endpoint**: `POST /api/webhooks/strategy-breakdown`

**Example AI Prompt**:
```
Goal: Achieve 360 Million Impressions in 2026
Business Unit: DRW Estetika (Skincare Brand)

As a strategic consultant, recommend:
1. Platform allocation (Instagram, TikTok, etc.) with percentages
2. Source allocation (Organic vs Paid) with percentages

Return JSON format:
{
  "breakdowns": [
    {"name": "Instagram @drw_official", "value": 40},
    {"name": "TikTok @drw_official", "value": 60},
    {"name": "Organik", "value": 50},
    {"name": "Paid Ads", "value": 50}
  ]
}
```

---

### Step 3: Manager Review #1 → Approve/Edit Breakdown
**Actor**: Manager (via Next.js Dashboard)  
**Action**: Reviews `proposed_breakdowns`, can:
- Approve (UPDATE `status = 'approved'`)
- Edit values
- Reject (DELETE or UPDATE `status = 'rejected'`)

**Database**: Updates `proposed_breakdowns` table  
**Next Step Trigger**: Approval triggers n8n Workflow #2  
**Status Change**: `strategic_goals.status` → `Awaiting KPI`

**UI Component**: `BreakdownApproval.tsx` (to be created)

---

### Step 4: AI Project Manager → KPI Generation
**Actor**: n8n Workflow #2 (AI Agent)  
**Trigger**: `proposed_breakdowns` with `status = 'approved'`  
**AI Role**: "Project Manager"  
**Action**: AI breaks down each approved breakdown into specific KPIs with suggested roles  
**Database**: Writes to `proposed_kpis` table  
**Data**:
- `kpi_id` (UUID)
- `goal_id` (FK to strategic_goals)
- `suggested_role_id` (e.g., Content Creator, Social Media Manager)
- `kpi_description` (e.g., "Generate 15M organic impressions monthly on Instagram")
- `target_bulanan` (monthly target)
- `platform` (e.g., "Instagram @drw_official")
- `source` (e.g., "Organik")
- `is_approved` (default: `false`)

**Webhook Endpoint**: `POST /api/webhooks/kpi-generation`

**Example AI Prompt**:
```
Approved Breakdown:
- Platform: Instagram @drw_official (40% = 144M impressions/year)
- Source: Organik

Create monthly KPIs for this breakdown:
1. Suggest appropriate role (Content Creator, Social Media Manager, etc.)
2. Break down into monthly targets
3. Provide specific, measurable descriptions

Return JSON format:
{
  "kpis": [
    {
      "suggested_role_id": 1,
      "kpi_description": "Generate 15M organic impressions monthly on Instagram",
      "target_bulanan": 15000000,
      "platform": "Instagram @drw_official",
      "source": "Organik"
    }
  ]
}
```

---

### Step 5: Manager Review #2 → Assign & Approve KPIs
**Actor**: Manager (via Next.js Dashboard)  
**Action**: Reviews `proposed_kpis`, must:
- Assign employee (`assigned_user_id`)
- Approve (UPDATE `is_approved = true`)

**Database**: Updates `proposed_kpis` table  
**Next Step Trigger**: Approval triggers n8n Workflow #3  
**Status Change**: `strategic_goals.status` → `Active`

**UI Component**: `KPIApproval.tsx` (already exists)

---

### Step 6: AI Task Generator → Daily Checklists
**Actor**: n8n Workflow #3 (AI Agent)  
**Trigger**: `proposed_kpis` with `is_approved = true` AND `assigned_user_id` is set  
**AI Role**: "Task Manager"  
**Action**: AI generates daily tasks (Monday-Friday) for the assigned employee  
**Database**: Writes to `daily_tasks` table  
**Data**:
- `task_id` (UUID)
- `kpi_id` (FK to proposed_kpis)
- `user_id` (assigned employee)
- `task_description` (e.g., "Research 3 trending TikTok audio")
- `task_date` (specific date)
- `is_completed` (default: `false`)

**Webhook Endpoint**: `POST /api/webhooks/daily-tasks`

**Example AI Prompt**:
```
KPI: Generate 15M organic impressions monthly on Instagram
Assigned To: John Doe (Content Creator)
Period: October 2025

Create daily actionable tasks (Monday-Friday) for this KPI.
Tasks should be:
1. Specific and measurable
2. Achievable in one day
3. Directly contribute to the KPI

Return JSON format:
{
  "tasks": [
    {
      "task_date": "2025-10-24",
      "task_description": "Research 3 trending Instagram Reels audio and save to content calendar"
    },
    {
      "task_date": "2025-10-24",
      "task_description": "Create 2 Instagram Reels using trending audio (duration: 15-30s)"
    }
  ]
}
```

---

## 🤖 AI Agent Roles Summary

| Agent Name | n8n Workflow | AI Role | Input | Output | Trigger |
|------------|--------------|---------|-------|--------|---------|
| **Strategy Consultant** | Workflow #1 | Strategic breakdown expert | `strategic_goals` | `proposed_breakdowns` | New goal with `status='Pending'` |
| **Project Manager** | Workflow #2 | KPI breakdown specialist | `proposed_breakdowns` (approved) | `proposed_kpis` | Breakdown `status='approved'` |
| **Task Generator** | Workflow #3 | Daily task planner | `proposed_kpis` (approved + assigned) | `daily_tasks` | KPI `is_approved=true` + has `assigned_user_id` |

---

## 📊 Database Tables & Relationships

```
business_units (Master Data)
    ↓
strategic_goals (Step 1: Manager Input)
    ↓
proposed_breakdowns (Step 2: AI Output → Step 3: Manager Review)
    ↓
proposed_kpis (Step 4: AI Output → Step 5: Manager Review)
    ↓
daily_tasks (Step 6: AI Output → Employee Execution)
    ↓
users (Employees with roles)
    ↓
roles (Content Creator, Social Media Manager, etc.)
```

---

## 🔌 Webhook Endpoints (for n8n)

### 1. Strategy Breakdown Webhook
**POST** `/api/webhooks/strategy-breakdown`

**Payload from n8n**:
```json
{
  "goal_id": "uuid",
  "breakdowns": [
    {"name": "Instagram @drw_official", "value": 40},
    {"name": "TikTok @drw_official", "value": 60}
  ]
}
```

**Action**: Insert multiple rows into `proposed_breakdowns`

---

### 2. KPI Generation Webhook
**POST** `/api/webhooks/kpi-generation`

**Payload from n8n**:
```json
{
  "goal_id": "uuid",
  "kpis": [
    {
      "suggested_role_id": 1,
      "kpi_description": "Generate 15M organic impressions monthly on Instagram",
      "target_bulanan": 15000000,
      "platform": "Instagram @drw_official",
      "source": "Organik"
    }
  ]
}
```

**Action**: Insert multiple rows into `proposed_kpis`

---

### 3. Daily Tasks Webhook
**POST** `/api/webhooks/daily-tasks`

**Payload from n8n**:
```json
{
  "kpi_id": "uuid",
  "user_id": "uuid",
  "tasks": [
    {
      "task_date": "2025-10-24",
      "task_description": "Research 3 trending Instagram Reels audio"
    }
  ]
}
```

**Action**: Insert multiple rows into `daily_tasks`

---

## 🛠️ Implementation Checklist

### Phase 1: Foundation (Current)
- [x] Prisma schema with 7 tables
- [x] Basic API endpoints (`/api/goals`, `/api/kpis`, `/api/tasks`)
- [x] GoalForm for Step 1
- [x] KPIApproval for Step 5

### Phase 2: AI Integration (Next)
- [ ] Create webhook endpoints for n8n
- [ ] Build `BreakdownApproval.tsx` component (Step 3)
- [ ] Add status management for workflow progression
- [ ] Implement n8n workflows with AI prompts

### Phase 3: Enhancement
- [ ] Real-time notifications for manager approvals
- [ ] Analytics dashboard for goal progress
- [ ] Employee task completion tracking
- [ ] Historical data & reporting

---

## 📝 Usage Guidelines

1. **All AI-generated data must go through manager approval** before progressing to the next step
2. **Each workflow is triggered by database status changes** (not time-based)
3. **Webhook endpoints must validate payloads** and handle errors gracefully
4. **Audit logging** is essential for all AI-generated content and manager decisions
5. **Employee assignments** are manual (by manager) to ensure proper workload distribution

---

## 🔐 Security Considerations

- Webhook endpoints must use authentication tokens
- Manager approval actions must be logged with timestamp and user_id
- AI-generated content should include metadata (model, prompt version, timestamp)
- Database triggers can be used to enforce workflow progression rules

---

## 📞 Contact & Support

For questions about agents, workflows, or AI integration:
- System Architecture: [Your Team]
- n8n Configuration: [Your Team]
- AI Prompt Engineering: [Your Team]
