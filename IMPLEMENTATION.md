# Implementation Guide - HRIS Next Gen AI Workflow

This document provides a complete implementation guide for the 6-step AI-powered workflow system.

## ✅ What Has Been Implemented

### 1. Database Schema (Prisma)
- ✅ All 7 tables created with proper relationships
- ✅ `strategic_goals` - Main goals table
- ✅ `proposed_breakdowns` - AI-generated strategy breakdown (NEW)
- ✅ `proposed_kpis` - AI-generated KPIs
- ✅ `daily_tasks` - Employee daily tasks
- ✅ `users`, `roles`, `business_units` - Master data

### 2. API Endpoints

#### Core APIs
- ✅ `GET/POST /api/goals` - Manage strategic goals
- ✅ `GET/POST /api/breakdowns` - Manage breakdowns
- ✅ `PATCH/DELETE /api/breakdowns/[id]` - Update/delete breakdowns
- ✅ `GET /api/kpis` - Get KPIs
- ✅ `PATCH /api/kpis/[id]` - Approve & assign KPIs
- ✅ `GET /api/tasks` - Get daily tasks
- ✅ `PATCH /api/tasks/[id]` - Mark task as completed
- ✅ `GET /api/users` - Get users
- ✅ `GET /api/roles` - Get roles
- ✅ `GET /api/business-units` - Get business units

#### Webhook APIs (for n8n)
- ✅ `POST /api/webhooks/strategy-breakdown` - Receive AI breakdowns (Step 2)
- ✅ `POST /api/webhooks/kpi-generation` - Receive AI KPIs (Step 4)
- ✅ `POST /api/webhooks/daily-tasks` - Receive AI tasks (Step 6)

### 3. UI Components
- ✅ `GoalForm` - Create multiple strategic goals (Step 1)
- ✅ `BreakdownApproval` - Review & approve AI breakdowns (Step 3)
- ✅ `KPIApproval` - Assign employees & approve KPIs (Step 5)
- ✅ `DailyTasksView` - View & complete daily tasks
- ✅ Goals Dashboard - Manage all goals with workflow progression

### 4. Features Implemented
- ✅ Multiple goals creation with auto-number formatting
- ✅ Role-based goal creation
- ✅ Business unit assignment
- ✅ Status-based workflow progression
- ✅ Edit/Approve/Reject breakdowns
- ✅ Assign employees to KPIs
- ✅ Real-time status updates

---

## 🔄 The Complete Workflow

### Step 1: Manager Creates Goal
**UI**: `/dashboard/goals/create`  
**Action**: Manager fills in basic goal information:
- Goal name
- Target value (auto-formatted with separators)
- Target unit (e.g., "Impressions")
- Business unit
- Creator role
- Date range

**Database**: Inserts into `strategic_goals` with `status = 'Pending'`

---

### Step 2: AI Generates Strategy Breakdown
**Trigger**: n8n detects new goal with `status = 'Pending'`  
**AI Prompt**: 
```
You are a strategic consultant. Analyze this goal:
- Goal: [goal_name]
- Target: [target_value] [target_unit]
- Business Unit: [business_unit_name]

Recommend strategic breakdowns (e.g., platform allocation, source allocation).
Return JSON with breakdown suggestions.
```

**n8n Action**: Calls `POST /api/webhooks/strategy-breakdown`  
**Payload**:
```json
{
  "goal_id": "uuid",
  "breakdowns": [
    {"name": "Instagram @drw_official", "value": 40},
    {"name": "TikTok @drw_official", "value": 60},
    {"name": "Organik", "value": 50},
    {"name": "Paid Ads", "value": 50}
  ]
}
```

**Database**: 
- Inserts into `proposed_breakdowns` with `status = 'pending_approval'`
- Updates `strategic_goals.status` → `'Awaiting Breakdown Approval'`

---

### Step 3: Manager Reviews Breakdowns
**UI**: `/dashboard/goals` → Click goal → `BreakdownApproval` component  
**Actions Available**:
1. **Edit**: Update breakdown name or value
2. **Approve**: Mark breakdown as approved
3. **Reject**: Delete breakdown
4. **Approve All**: Approve all breakdowns at once

**API Calls**:
- `PATCH /api/breakdowns/[id]` - Edit or approve
- `DELETE /api/breakdowns/[id]` - Reject

**Database**: Updates `proposed_breakdowns.status` → `'approved'`

**Trigger**: When all breakdowns approved → n8n Workflow #2 fires

---

### Step 4: AI Generates KPIs
**Trigger**: n8n detects breakdowns with `status = 'approved'`  
**AI Prompt**:
```
You are a project manager. For this approved breakdown:
- Breakdown: [name] ([value]%)
- Parent Goal: [goal_name]

Create monthly KPIs:
1. Suggest appropriate role (Content Creator, Social Media Manager, etc.)
2. Break down into monthly targets
3. Provide specific, measurable descriptions

Return JSON with KPI details.
```

**n8n Action**: Calls `POST /api/webhooks/kpi-generation`  
**Payload**:
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

**Database**:
- Inserts into `proposed_kpis` with `is_approved = false`
- Updates `strategic_goals.status` → `'Awaiting KPI Approval'`

---

### Step 5: Manager Assigns & Approves KPIs
**UI**: `/dashboard/goals` → Click goal → `KPIApproval` component  
**Actions**:
1. Select employee from dropdown (filtered by suggested role)
2. Approve KPI (sets `is_approved = true`)

**API Call**: `PATCH /api/kpis/[id]`  
**Payload**:
```json
{
  "assigned_user_id": "user-uuid",
  "is_approved": true
}
```

**Database**: Updates `proposed_kpis`

**Trigger**: When KPI approved + assigned → n8n Workflow #3 fires

---

### Step 6: AI Generates Daily Tasks
**Trigger**: n8n detects KPIs with `is_approved = true` AND `assigned_user_id` is set  
**AI Prompt**:
```
You are a task manager. For this KPI:
- KPI: [kpi_description]
- Target: [target_bulanan] per month
- Assigned To: [user_name] ([role_name])
- Period: [current_month]

Create daily actionable tasks (Monday-Friday) for this week.
Tasks should be:
1. Specific and measurable
2. Achievable in one day
3. Directly contribute to the KPI

Return JSON with daily tasks.
```

**n8n Action**: Calls `POST /api/webhooks/daily-tasks`  
**Payload**:
```json
{
  "kpi_id": "uuid",
  "user_id": "uuid",
  "tasks": [
    {
      "task_date": "2025-10-24",
      "task_description": "Research 3 trending Instagram Reels audio"
    },
    {
      "task_date": "2025-10-25",
      "task_description": "Create 2 Instagram Reels using trending audio"
    }
  ]
}
```

**Database**:
- Inserts into `daily_tasks` with `is_completed = false`
- Updates `strategic_goals.status` → `'Active'`

---

## 🛠️ n8n Workflow Configuration

### Workflow #1: Strategy Breakdown Generator

**Trigger**: Postgres Trigger Node
- Table: `strategic_goals`
- Condition: `status = 'Pending'`

**Nodes**:
1. **Postgres Trigger** → Detect new goals
2. **HTTP Request** → Fetch goal details from `/api/goals?goal_id=xxx`
3. **OpenAI Node** → Generate breakdowns with AI
4. **HTTP Request** → POST to `/api/webhooks/strategy-breakdown`

**OpenAI Configuration**:
- Model: GPT-4 or GPT-3.5-turbo
- System Prompt: "You are a strategic business consultant..."
- Response Format: JSON

---

### Workflow #2: KPI Generator

**Trigger**: Postgres Trigger Node
- Table: `proposed_breakdowns`
- Condition: `status = 'approved'`

**Nodes**:
1. **Postgres Trigger** → Detect approved breakdowns
2. **HTTP Request** → Fetch breakdown & goal details
3. **OpenAI Node** → Generate KPIs with AI
4. **HTTP Request** → POST to `/api/webhooks/kpi-generation`

---

### Workflow #3: Daily Task Generator

**Trigger**: Postgres Trigger Node
- Table: `proposed_kpis`
- Condition: `is_approved = true AND assigned_user_id IS NOT NULL`

**Nodes**:
1. **Postgres Trigger** → Detect approved & assigned KPIs
2. **HTTP Request** → Fetch KPI, user, and role details
3. **OpenAI Node** → Generate daily tasks with AI
4. **HTTP Request** → POST to `/api/webhooks/daily-tasks`

---

## 🚀 Getting Started

### 1. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (if needed)
npx prisma migrate dev

# Seed master data
npx prisma db seed
```

### 2. Environment Variables
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hris"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Configure n8n
1. Install n8n: `npm install -g n8n`
2. Run n8n: `n8n start`
3. Import workflows from `/n8n-workflows/` directory
4. Configure database connections
5. Add OpenAI API credentials
6. Set webhook URLs to your Next.js app

---

## 📋 Testing the Workflow

### Test Step 1-2: Goal Creation → AI Breakdown
1. Go to `/dashboard/goals/create`
2. Fill in goal details:
   - Goal Name: "Target 360 Juta Impresi 2026"
   - Target Value: 360.000.000
   - Target Unit: "Impressions"
   - Business Unit: Select one
   - Role: Select creator role
3. Submit form
4. Check database: `strategic_goals` should have new row with `status = 'Pending'`
5. n8n Workflow #1 should trigger
6. Check database: `proposed_breakdowns` should have AI-generated breakdowns
7. Goal status should change to `'Awaiting Breakdown Approval'`

### Test Step 3-4: Breakdown Approval → AI KPI Generation
1. Go to `/dashboard/goals`
2. Click on the goal
3. Review breakdowns in `BreakdownApproval` component
4. Edit if needed, then click "Approve All"
5. Check database: breakdowns should have `status = 'approved'`
6. n8n Workflow #2 should trigger
7. Check database: `proposed_kpis` should have AI-generated KPIs
8. Goal status should change to `'Awaiting KPI Approval'`

### Test Step 5-6: KPI Assignment → AI Task Generation
1. Stay on goal detail page
2. `KPIApproval` component should now show
3. For each KPI:
   - Select employee
   - Click approve
4. Check database: KPIs should have `assigned_user_id` and `is_approved = true`
5. n8n Workflow #3 should trigger
6. Check database: `daily_tasks` should have AI-generated tasks
7. Goal status should change to `'Active'`

---

## 🔧 Troubleshooting

### Webhook Not Receiving Data
- Check n8n is running
- Verify webhook URL in n8n workflow
- Check Next.js app is accessible from n8n
- Review n8n execution logs

### Database Triggers Not Firing
- Verify Postgres trigger nodes in n8n
- Check database connection in n8n
- Ensure polling interval is set correctly

### AI Responses Malformed
- Review OpenAI prompt engineering
- Check response format in n8n
- Validate JSON parsing in webhook endpoints

### Status Not Updating
- Check database transactions
- Verify status values match schema enum
- Review API endpoint logic

---

## 📚 Next Steps

1. **Add Authentication**: Implement NextAuth.js for user login
2. **Add Notifications**: Real-time alerts for managers
3. **Analytics Dashboard**: Track goal progress, KPI completion
4. **Task Completion**: Employee interface for marking tasks done
5. **Historical Data**: Reports and insights from past goals
6. **Mobile App**: React Native app for employees

---

## 📞 Support

For questions or issues:
- Check agents.md for workflow details
- Review API.md for endpoint documentation
- See DATABASE.md for schema information
