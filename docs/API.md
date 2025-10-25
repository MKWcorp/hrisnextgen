# API Documentation

Dokumentasi lengkap API endpoints untuk HRIS Next Gen.

## Base URL
```
http://localhost:3000/api
```

---

## 🎯 Goals API

### Get All Goals
**GET** `/api/goals`

**Query Parameters:**
- `status` (optional): Filter by status (`Pending`, `Awaiting Approval`, `Active`)

**Response:**
```json
[
  {
    "goal_id": "uuid",
    "goal_name": "Target Impresi 2026 DRW Skincare",
    "target_value": "360000000",
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "alokasi_platform": [
      {"platform": "IG @drw_official", "percentage": 40},
      {"platform": "TikTok @drw_official", "percentage": 60}
    ],
    "alokasi_sumber": [
      {"source": "Organik", "percentage": 50},
      {"source": "Paid Ads", "percentage": 50}
    ],
    "status": "Pending",
    "created_at": "2025-10-24T10:00:00Z",
    "proposed_kpis": []
  }
]
```

### Create New Goal
**POST** `/api/goals`

**Request Body:**
```json
{
  "goal_name": "Target Impresi 2026 DRW Skincare",
  "target_value": 360000000,
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "alokasi_platform": [
    {"platform": "IG @drw_official", "percentage": 40},
    {"platform": "TikTok @drw_official", "percentage": 60}
  ],
  "alokasi_sumber": [
    {"source": "Organik", "percentage": 50},
    {"source": "Paid Ads", "percentage": 50}
  ]
}
```

**Response:** `201 Created`
```json
{
  "goal_id": "uuid",
  "goal_name": "Target Impresi 2026 DRW Skincare",
  "target_value": "360000000",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "alokasi_platform": [...],
  "alokasi_sumber": [...],
  "status": "Pending",
  "created_at": "2025-10-24T10:00:00Z"
}
```

---

## 📊 KPIs API

### Get All KPIs
**GET** `/api/kpis`

**Query Parameters:**
- `goal_id` (optional): Filter by goal ID
- `is_approved` (optional): Filter by approval status (`true` or `false`)

**Response:**
```json
[
  {
    "kpi_id": "uuid",
    "goal_id": "uuid",
    "suggested_role_id": 1,
    "assigned_user_id": "uuid",
    "kpi_description": "Menghasilkan 15 Juta impresi organik bulanan di IG",
    "target_bulanan": "15000000",
    "platform": "IG @drw_official",
    "source": "Organik",
    "is_approved": false,
    "roles": {
      "role_id": 1,
      "role_name": "Content Creator"
    },
    "users": {
      "user_id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "strategic_goals": {
      "goal_id": "uuid",
      "goal_name": "Target Impresi 2026 DRW Skincare"
    }
  }
]
```

### Update KPI (Assign & Approve)
**PATCH** `/api/kpis/[id]`

**Request Body:**
```json
{
  "assigned_user_id": "uuid",
  "is_approved": true
}
```

**Response:**
```json
{
  "kpi_id": "uuid",
  "goal_id": "uuid",
  "assigned_user_id": "uuid",
  "is_approved": true,
  ...
}
```

---

## ✅ Tasks API

### Get Daily Tasks
**GET** `/api/tasks`

**Query Parameters:**
- `user_id` (optional): Filter by user ID
- `task_date` (optional): Filter by date (format: `YYYY-MM-DD`)
- `is_completed` (optional): Filter by completion status (`true` or `false`)

**Response:**
```json
[
  {
    "task_id": "uuid",
    "kpi_id": "uuid",
    "user_id": "uuid",
    "task_description": "Riset 3 tren audio TikTok terbaru",
    "task_date": "2025-10-24",
    "is_completed": false,
    "completed_at": null,
    "users": {
      "user_id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "proposed_kpis": {
      "kpi_id": "uuid",
      "kpi_description": "Menghasilkan 15 Juta impresi organik bulanan",
      "platform": "TikTok @drw_official",
      "source": "Organik",
      "strategic_goals": {
        "goal_id": "uuid",
        "goal_name": "Target Impresi 2026 DRW Skincare"
      }
    }
  }
]
```

### Create New Task
**POST** `/api/tasks`

**Request Body:**
```json
{
  "kpi_id": "uuid",
  "user_id": "uuid",
  "task_description": "Riset 3 tren audio TikTok terbaru",
  "task_date": "2025-10-24"
}
```

**Response:** `201 Created`
```json
{
  "task_id": "uuid",
  "kpi_id": "uuid",
  "user_id": "uuid",
  "task_description": "Riset 3 tren audio TikTok terbaru",
  "task_date": "2025-10-24",
  "is_completed": false,
  "completed_at": null
}
```

### Update Task (Mark as Completed)
**PATCH** `/api/tasks/[id]`

**Request Body:**
```json
{
  "is_completed": true
}
```

**Response:**
```json
{
  "task_id": "uuid",
  "task_description": "Riset 3 tren audio TikTok terbaru",
  "is_completed": true,
  "completed_at": "2025-10-24T14:30:00Z",
  ...
}
```

---

## 👥 Users API

### Get All Users
**GET** `/api/users`

**Query Parameters:**
- `role_id` (optional): Filter by role ID

**Response:**
```json
[
  {
    "user_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role_id": 1,
    "created_at": "2025-10-01T08:00:00Z",
    "roles": {
      "role_id": 1,
      "role_name": "Content Creator",
      "description": "Membuat konten harian untuk platform sosial media"
    }
  }
]
```

---

## 🔔 Webhook Endpoints (for n8n Integration)

### Webhook #1: Goal Created → AI Breakdown KPI
**Trigger:** When new goal is created (INSERT on `strategic_goals`)

**n8n Webhook URL:** `https://your-n8n-instance.com/webhook/goal-breakdown`

**Payload:**
```json
{
  "goal_id": "uuid",
  "goal_name": "Target Impresi 2026 DRW Skincare",
  "target_value": 360000000,
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "alokasi_platform": [...],
  "alokasi_sumber": [...]
}
```

**Expected Action:**
1. n8n calls AI (Gemini/OpenAI) with formatted prompt
2. AI returns KPI breakdown with role recommendations
3. n8n inserts multiple rows into `proposed_kpis` table
4. n8n updates `strategic_goals.status` to `"Awaiting Approval"`

---

### Webhook #2: KPI Approved → Generate Daily Tasks
**Trigger:** When KPI is approved (UPDATE `is_approved = true` on `proposed_kpis`)

**n8n Webhook URL:** `https://your-n8n-instance.com/webhook/generate-tasks`

**Payload:**
```json
{
  "kpi_id": "uuid",
  "user_id": "uuid",
  "kpi_description": "Menghasilkan 15 Juta impresi organik bulanan",
  "target_bulanan": 15000000,
  "platform": "TikTok @drw_official",
  "source": "Organik",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31"
}
```

**Expected Action:**
1. n8n calls AI with formatted prompt ("Generate daily tasks for this KPI")
2. AI returns list of daily tasks (e.g., Monday-Friday activities)
3. n8n bulk inserts tasks into `daily_tasks` table for the assigned user
4. Tasks are distributed across the date range (start_date to end_date)

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request body"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to process request"
}
```

---

## Testing with cURL

### Create a Goal
```bash
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -d '{
    "goal_name": "Test Goal",
    "target_value": 1000000,
    "start_date": "2026-01-01",
    "end_date": "2026-12-31",
    "alokasi_platform": [{"platform": "TikTok", "percentage": 100}],
    "alokasi_sumber": [{"source": "Organik", "percentage": 100}]
  }'
```

### Get KPIs for a Goal
```bash
curl http://localhost:3000/api/goals?status=Pending
```

### Mark Task as Completed
```bash
curl -X PATCH http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"is_completed": true}'
```

---

## Next Steps for Integration

1. **Setup n8n Workflows**
   - Create Workflow #1: Goal → AI → KPI Breakdown
   - Create Workflow #2: KPI Approved → AI → Daily Tasks

2. **Configure Database Triggers** (Optional)
   - PostgreSQL trigger on INSERT to `strategic_goals` → HTTP POST to n8n webhook
   - Or poll from n8n every minute for new pending goals

3. **Test AI Prompts**
   - Design prompt for KPI breakdown
   - Design prompt for daily task generation
   - Test with real data

4. **Add Authentication**
   - Implement NextAuth.js or similar
   - Protect API routes
   - Add user session management
