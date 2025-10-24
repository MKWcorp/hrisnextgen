# HRIS Next Gen - Performance Management System

Platform HRIS Performance Management cerdas yang mem-breakdown target strategis (Goals) menjadi KPI terukur dan daily tasks untuk karyawan, menggunakan n8n dan AI.

## 📁 Struktur Proyek

```
HRIS_NEXT_GEN/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── goals/           # Strategic Goals endpoints
│   │   ├── kpis/            # KPI endpoints
│   │   ├── tasks/           # Daily Tasks endpoints
│   │   └── users/           # Users endpoints
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/               # React Components
│   ├── DailyTasksView.tsx   # Komponen untuk daily tasks karyawan
│   ├── GoalForm.tsx         # Form input strategic goals
│   └── KPIApproval.tsx      # Komponen approve & assign KPI
├── lib/                      # Utilities
│   └── prisma.ts            # Prisma client instance
├── prisma/                   # Database Schema
│   └── schema.prisma        # Database models
├── types/                    # TypeScript Types
│   └── index.ts             # Type definitions
├── generated/                # Generated Prisma Client
├── public/                   # Static assets
├── .env                      # Environment variables
├── .gitignore
├── DATABASE.md              # Dokumentasi database lengkap
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── package.json
└── README.md

```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm atau pnpm

### Installation

1. Clone atau buka folder proyek:
```bash
cd HRIS_NEXT_GEN
```

2. Install dependencies (sudah dilakukan):
```bash
npm install
```

3. Setup environment variables (`.env` sudah ada):
```env
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

5. Run development server:
```bash
npm run dev
```

6. Buka browser: `http://localhost:3000`

## 📊 Alur Data

1. **Goal Setting** → Manajer input target strategis
2. **AI Breakdown** → n8n + AI menghasilkan KPI
3. **Approval** → Manajer assign & approve KPI
4. **Task Generation** → n8n + AI buat daily tasks
5. **Execution** → Karyawan menyelesaikan tasks harian

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Automation**: n8n (akan diintegrasikan)
- **AI**: Google Gemini / OpenAI (akan diintegrasikan)

## 📝 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 🗄️ Database

Lihat dokumentasi lengkap di [DATABASE.md](./DATABASE.md)

**Tabel Utama:**
- `roles` - Peran/jabatan karyawan
- `users` - Data karyawan
- `strategic_goals` - Target strategis
- `proposed_kpis` - KPI yang diusulkan AI
- `daily_tasks` - Tugas harian karyawan

## 🔌 API Endpoints

### Goals
- `GET /api/goals?status=Pending` - List goals
- `POST /api/goals` - Create new goal

### KPIs
- `GET /api/kpis?goal_id=xxx&is_approved=false` - List KPIs
- `PATCH /api/kpis/[id]` - Update KPI (assign & approve)

### Tasks
- `GET /api/tasks?user_id=xxx&task_date=2025-10-24` - List tasks
- `POST /api/tasks` - Create task (for n8n webhook)
- `PATCH /api/tasks/[id]` - Update task (mark completed)

### Users
- `GET /api/users?role_id=1` - List users

## 🎨 Components

### GoalForm
Form untuk manajer input target strategis dengan alokasi platform dan sumber trafik.

### KPIApproval
Interface untuk manajer review KPI dari AI, assign ke karyawan, dan approve.

### DailyTasksView
Dashboard karyawan untuk melihat dan menyelesaikan daily tasks.

## 🔄 Integrasi n8n (Coming Soon)

1. **Workflow #1**: Goal → AI → KPI Breakdown
2. **Workflow #2**: KPI Approved → AI → Daily Tasks

Webhook endpoints akan ditambahkan untuk trigger dari database.

## 📈 Next Steps

- [ ] Integrasi n8n workflows
- [ ] Setup AI prompts (Gemini/OpenAI)
- [ ] Implementasi authentication
- [ ] Dashboard analytics & reporting
- [ ] Mobile responsive improvements

## 📄 License

Private - Internal Company Use

---

**Dokumentasi Database**: Lihat [DATABASE.md](./DATABASE.md) untuk detail lengkap skema database.
