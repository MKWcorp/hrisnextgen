# HRIS Next Gen - Strategic Goal Management System# HRIS Next Gen - Performance Management System



Platform HRIS Performance Management cerdas yang mem-breakdown target strategis (Goals) menjadi KPI terukur dan daily tasks untuk karyawan, menggunakan n8n dan AI.Platform HRIS Performance Management cerdas yang mem-breakdown target strategis (Goals) menjadi KPI terukur dan daily tasks untuk karyawan, menggunakan n8n dan AI.



---## 📁 Struktur Proyek



## 📁 Struktur Folder (Setelah Cleanup)```

HRIS_NEXT_GEN/

```├── app/                      # Next.js App Router

HRIS_NEXT_GEN/│   ├── api/                  # API Routes

├── .env                      # Environment variables (DATABASE_URL, N8N_WEBHOOK, dll)│   │   ├── goals/           # Strategic Goals endpoints

├── .env.example              # Template environment variables│   │   ├── kpis/            # KPI endpoints

├── README.md                 # Dokumentasi utama│   │   ├── tasks/           # Daily Tasks endpoints

├── prisma.config.ts          # Konfigurasi Prisma│   │   └── users/           # Users endpoints

││   ├── favicon.ico

├── docs/                     # 📚 Semua dokumentasi│   ├── globals.css

│   ├── agents.md            # Dokumentasi sistem AI agents│   ├── layout.tsx

│   ├── API.md               # Referensi lengkap API endpoints│   └── page.tsx

│   ├── ARCHITECTURE.md      # Arsitektur sistem & design decisions├── components/               # React Components

│   ├── DATABASE.md          # Schema database & relasi lengkap│   ├── DailyTasksView.tsx   # Komponen untuk daily tasks karyawan

│   ├── SEEDING_GUIDE.md     # Panduan seeding data testing│   ├── GoalForm.tsx         # Form input strategic goals

│   └── n8n/                 # Dokumentasi n8n workflows (9 files)│   └── KPIApproval.tsx      # Komponen approve & assign KPI

│       ├── N8N_SETUP.md├── lib/                      # Utilities

│       ├── N8N_WORKFLOW_SETUP.md│   └── prisma.ts            # Prisma client instance

│       ├── N8N_AI_PROMPT_INDONESIA.md├── prisma/                   # Database Schema

│       └── ... (dan lain-lain)│   └── schema.prisma        # Database models

│├── types/                    # TypeScript Types

├── prisma/                   # 🗄️ Database schema & migrations│   └── index.ts             # Type definitions

│   ├── schema.prisma        # Schema database utama├── generated/                # Generated Prisma Client

│   └── seed.sql             # SQL seed data untuk testing├── public/                   # Static assets

│├── .env                      # Environment variables

├── generated/                # 🤖 Auto-generated Prisma client├── .gitignore

│   └── prisma/              # ⚠️ Jangan edit manual!├── DATABASE.md              # Dokumentasi database lengkap

│├── next.config.ts           # Next.js configuration

└── hris-dashboard/          # 🚀 Next.js Application (Main App)├── tsconfig.json            # TypeScript configuration

    ├── app/                 # App Router Next.js 15├── package.json

    │   ├── api/            # API Routes└── README.md

    │   │   ├── analysis/   # AI analysis & breakdowns endpoints

    │   │   ├── check-status/ # Polling status endpoint```

    │   │   ├── goals/      # CRUD strategic goals

    │   │   ├── kpis/       # CRUD KPIs## 🚀 Quick Start

    │   │   ├── review/     # Review & edit AI recommendations

    │   │   └── tasks/      # CRUD daily tasks### Prerequisites

    │   │- Node.js 20+

    │   ├── dashboard/      # Dashboard pages- PostgreSQL 14+

    │   │   ├── analysis/[batch_id]/  # Halaman hasil analisa AI- npm atau pnpm

    │   │   ├── goals/                # Halaman goals management

    │   │   └── review/[batchId]/     # Halaman review & edit rekomendasi### Installation

    │   │

    │   ├── globals.css     # Global styles1. Clone atau buka folder proyek:

    │   ├── layout.tsx      # Root layout```bash

    │   └── page.tsx        # Homepagecd HRIS_NEXT_GEN

    │```

    ├── components/          # React components reusable

    │   ├── GoalForm.tsx2. Install dependencies (sudah dilakukan):

    │   └── KPIApproval.tsx```bash

    │npm install

    ├── lib/                 # Utilities & helpers```

    │   └── prisma.ts       # Prisma client singleton

    │3. Setup environment variables (`.env` sudah ada):

    ├── types/               # TypeScript type definitions```env

    │   └── index.tsDATABASE_URL="postgresql://username:password@host:port/database?schema=public"

    │```

    ├── public/              # Static assets

    │4. Generate Prisma Client:

    ├── package.json         # Dependencies & scripts```bash

    ├── next.config.ts       # Next.js configurationnpx prisma generate

    ├── tsconfig.json        # TypeScript configuration```

    └── eslint.config.mjs    # ESLint configuration

```5. Run development server:

```bash

---npm run dev

```

## 🚀 Quick Start

6. Buka browser: `http://localhost:3000`

### Prerequisites

- **Node.js 20+**## 📊 Alur Data

- **PostgreSQL 14+**

- **npm atau pnpm**1. **Goal Setting** → Manajer input target strategis

2. **AI Breakdown** → n8n + AI menghasilkan KPI

### Installation3. **Approval** → Manajer assign & approve KPI

4. **Task Generation** → n8n + AI buat daily tasks

1. **Clone atau buka folder proyek**:5. **Execution** → Karyawan menyelesaikan tasks harian

```bash

cd HRIS_NEXT_GEN## 🛠️ Tech Stack

```

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS

2. **Install dependencies**:- **Backend**: Next.js API Routes

```bash- **Database**: PostgreSQL + Prisma ORM

cd hris-dashboard- **Automation**: n8n (akan diintegrasikan)

npm install- **AI**: Google Gemini / OpenAI (akan diintegrasikan)

```

## 📝 Available Scripts

3. **Setup environment variables** (`.env` di root):

```env```bash

DATABASE_URL="postgresql://username:password@host:port/database?schema=public"npm run dev        # Start development server

N8N_WORKFLOW_1_WEBHOOK_URL="https://n8n.drwapp.com/webhook/hrisnextgen-analysis"npm run build      # Build for production

N8N_WORKFLOW_2_WEBHOOK_URL="https://n8n.drwapp.com/webhook/hrisnextgen-kpi-breakdown"npm run start      # Start production server

```npm run lint       # Run ESLint

```

4. **Generate Prisma Client**:

```bash## 🗄️ Database

npx prisma generate

```Lihat dokumentasi lengkap di [DATABASE.md](./DATABASE.md)



5. **Run database migrations** (jika diperlukan):**Tabel Utama:**

```bash- `roles` - Peran/jabatan karyawan

npx prisma db push- `users` - Data karyawan

```- `strategic_goals` - Target strategis

- `proposed_kpis` - KPI yang diusulkan AI

6. **Seed database dengan data testing** (opsional):- `daily_tasks` - Tugas harian karyawan

```bash

psql -U username -d database -f ../prisma/seed.sql## 🔌 API Endpoints

# Atau lihat docs/SEEDING_GUIDE.md untuk detail

```### Goals

- `GET /api/goals?status=Pending` - List goals

7. **Run development server**:- `POST /api/goals` - Create new goal

```bash

npm run dev### KPIs

```- `GET /api/kpis?goal_id=xxx&is_approved=false` - List KPIs

- `PATCH /api/kpis/[id]` - Update KPI (assign & approve)

8. **Buka browser**: `http://localhost:3000`

### Tasks

---- `GET /api/tasks?user_id=xxx&task_date=2025-10-24` - List tasks

- `POST /api/tasks` - Create task (for n8n webhook)

## 📊 Alur Sistem- `PATCH /api/tasks/[id]` - Update task (mark completed)



### 1. Goal Setting (Manual)### Users

Manajer input strategic goals dengan target value dan alokasi platform- `GET /api/users?role_id=1` - List users



### 2. AI Analysis (n8n Workflow #1)## 🎨 Components

- Trigger: Button "Rekomendasi AI" di dashboard goals

- n8n webhook menerima data goals → AI breakdown → Save ke database### GoalForm

- Status: `Draft` → `review_pending`Form untuk manajer input target strategis dengan alokasi platform dan sumber trafik.



### 3. Review & Edit (Manual)### KPIApproval

- Polling check status setiap 3 detikInterface untuk manajer review KPI dari AI, assign ke karyawan, dan approve.

- Redirect ke halaman review setelah AI selesai

- Manajer review & edit rekomendasi AI### DailyTasksView

- Submit → Trigger n8n Workflow #2Dashboard karyawan untuk melihat dan menyelesaikan daily tasks.

- Status: `review_pending` → `KPI_Breakdown_Pending`

## 🔄 Integrasi n8n (Coming Soon)

### 4. KPI Breakdown (n8n Workflow #2)

- AI generate detailed KPI breakdown dari goals + recommendations1. **Workflow #1**: Goal → AI → KPI Breakdown

- Save proposed_kpis ke database2. **Workflow #2**: KPI Approved → AI → Daily Tasks

- Status: `KPI_Breakdown_Pending` → `KPI_Review_Pending`

Webhook endpoints akan ditambahkan untuk trigger dari database.

### 5. KPI Approval (Manual)

- Manajer assign KPI ke karyawan## 📈 Next Steps

- Approve KPI yang sudah siap

- Status: `Proposed` → `Approved`- [ ] Integrasi n8n workflows

- [ ] Setup AI prompts (Gemini/OpenAI)

### 6. Task Execution (Daily)- [ ] Implementasi authentication

- Karyawan lihat daily tasks di dashboard- [ ] Dashboard analytics & reporting

- Mark completed setelah selesai- [ ] Mobile responsive improvements

- Track progress secara real-time

## 📄 License

---

Private - Internal Company Use

## 🛠️ Tech Stack

---

| Layer | Technology |

|-------|-----------|**Dokumentasi Database**: Lihat [DATABASE.md](./DATABASE.md) untuk detail lengkap skema database.

| **Frontend** | Next.js 16, React 19, TypeScript, TailwindCSS |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | PostgreSQL 14+ |
| **Automation** | n8n Workflows |
| **AI** | Google Gemini / OpenAI (via n8n) |
| **Deployment** | Vercel (Frontend) + Railway/AWS (Database) |

---

## 📝 Available Scripts

```bash
# Development
cd hris-dashboard
npm run dev        # Start dev server (Turbopack)
npm run build      # Build untuk production
npm run start      # Start production server
npm run lint       # Run ESLint

# Database
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema ke database
npx prisma studio       # Open Prisma Studio GUI
```

---

## 🗄️ Database Schema

Lihat dokumentasi lengkap di **[docs/DATABASE.md](./docs/DATABASE.md)**

### Tabel Utama:
- `roles` - Peran/jabatan karyawan (Admin, Manager, Staff)
- `users` - Data karyawan dengan relasi role & business unit
- `business_units` - Unit bisnis / departemen
- `strategic_goals` - Target strategis dari manajer
- `analysis_batches` - Batch analisa AI dengan status tracking
- `ai_recommended_roles` - Rekomendasi role dari AI
- `proposed_breakdowns` - Breakdown target dari AI (editable)
- `proposed_kpis` - KPI yang diusulkan AI untuk approval
- `daily_tasks` - Tugas harian karyawan dari KPI

### Relasi Penting:
```
strategic_goals → analysis_batches → ai_recommended_roles
                                  → proposed_breakdowns
                                  → proposed_kpis → daily_tasks
```

---

## 🔌 API Endpoints

### Goals
- `GET /api/goals` - List all goals dengan filter
- `POST /api/goals` - Create new strategic goal
- `POST /api/goals/analyze` - Trigger AI analysis (n8n Workflow #1)

### Check Status (Polling)
- `GET /api/check-status/[batch_id]` - Check analisa AI status

### Review & Edit
- `GET /api/review/[batch_id]` - Fetch batch data untuk review
- `POST /api/review/[batch_id]` - Save edited breakdowns + trigger Workflow #2

### Analysis
- `GET /api/analysis/batch/[batch_id]` - Get batch info
- `GET /api/analysis/breakdowns/[batch_id]` - Get all breakdowns
- `POST /api/analysis/breakdowns/[batch_id]` - Create breakdown
- `PATCH /api/analysis/breakdowns/[batch_id]` - Update breakdown

### KPIs
- `GET /api/kpis` - List KPIs dengan filter
- `PATCH /api/kpis/[id]` - Update KPI (assign & approve)

### Tasks
- `GET /api/tasks` - List tasks dengan filter
- `POST /api/tasks` - Create task (untuk n8n webhook)
- `PATCH /api/tasks/[id]` - Update task status

Lihat **[docs/API.md](./docs/API.md)** untuk detail lengkap request/response.

---

## 🎨 Components

### GoalForm (`components/GoalForm.tsx`)
Form untuk manajer input target strategis dengan:
- Goal name, description, target value & unit
- Date range (start date, end date)
- Alokasi platform (TikTok, Shopee, dll)
- Sumber trafik (Organic, Paid Ads, dll)

### KPIApproval (`components/KPIApproval.tsx`)
Interface untuk manajer:
- Review KPI yang dihasilkan AI
- Assign KPI ke karyawan (dropdown by role)
- Approve/reject KPI
- Real-time status update

---

## 🔄 Integrasi n8n

### Workflow #1: Goal Analysis
**Endpoint**: `POST /api/goals/analyze`
**n8n Webhook**: `N8N_WORKFLOW_1_WEBHOOK_URL`

**Flow**:
1. Frontend POST data goals ke API
2. API save analysis_batch dengan status `Draft`
3. Trigger n8n webhook dengan batch_id + goals data
4. n8n → AI → Generate recommendations
5. n8n POST recommendations kembali ke API
6. API update status → `review_pending`

### Workflow #2: KPI Breakdown
**Endpoint**: `POST /api/review/[batch_id]`
**n8n Webhook**: `N8N_WORKFLOW_2_WEBHOOK_URL`

**Flow**:
1. Frontend POST edited breakdowns
2. API save breakdowns + update status → `KPI_Breakdown_Pending`
3. Trigger n8n webhook dengan batch_id
4. n8n → AI → Generate detailed KPI
5. n8n POST KPIs kembali ke API
6. API save proposed_kpis + update status → `KPI_Review_Pending`

Dokumentasi lengkap n8n ada di **[docs/n8n/](./docs/n8n/)**.

---

## 📚 Dokumentasi Lengkap

| File | Deskripsi |
|------|-----------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arsitektur sistem & design decisions |
| [docs/DATABASE.md](./docs/DATABASE.md) | Schema database lengkap dengan relasi |
| [docs/API.md](./docs/API.md) | API endpoints reference |
| [docs/agents.md](./docs/agents.md) | AI agents & prompts documentation |
| [docs/SEEDING_GUIDE.md](./docs/SEEDING_GUIDE.md) | Panduan seeding data testing |
| [docs/n8n/](./docs/n8n/) | Dokumentasi n8n workflows (9 files) |

---

## 🐛 Troubleshooting

### Error: "Failed to fetch data"
- Pastikan dev server running di `hris-dashboard/`
- Check `.env` DATABASE_URL sudah benar
- Run `npx prisma generate` untuk generate client

### Error: "Batch not found"
- Batch ID tidak ada di database
- Run seed SQL atau buat goals baru untuk testing

### Next.js 15 Params Error
- Semua dynamic routes sudah fixed untuk await params
- Jangan downgrade Next.js, sudah kompatibel

### Prisma Client Error
- Delete `node_modules/.prisma` dan `generated/`
- Run `npx prisma generate` ulang
- Restart dev server

---

## 📈 Roadmap

- [x] Database schema & migrations
- [x] API endpoints (Goals, KPIs, Tasks)
- [x] Dashboard UI (Goals, Analysis, Review)
- [x] n8n integration (Workflow #1 & #2)
- [x] Polling system untuk check status
- [x] Review & edit page untuk AI recommendations
- [ ] Authentication & authorization
- [ ] Role-based access control (RBAC)
- [ ] Dashboard analytics & reporting
- [ ] Mobile responsive improvements
- [ ] Notification system (email/push)
- [ ] Task reminder & deadline tracking

---

## 📄 License

**Private - Internal Company Use Only**

---

**Dokumentasi Lengkap**: Semua dokumentasi teknis ada di folder **`docs/`** 📚
