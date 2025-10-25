# Dokumentasi Database: Proyek HRIS Performance Management Cerdas

Dokumen ini menjelaskan skema database PostgreSQL yang dirancang untuk platform HRIS Performance Management cerdas. Tujuan utamanya adalah untuk mem-breakdown target strategis (Goals) menjadi KPI yang terukur dan akhirnya menjadi checklist harian (Daily Tasks) untuk karyawan, menggunakan n8n dan AI.

## Alur Data (Data Flow)

Alur data di dalam sistem ini adalah sebagai berikut:

1.  **Goal Setting (Manajer):** Seorang Manajer menginput target besar (misal: 360 Juta Impresi) melalui Dashboard.
    * **Aksi:** `INSERT` 1 baris baru ke tabel `strategic_goals`.
    * **Status:** `status` di `strategic_goals` diset ke `"Pending"`.

2.  **Workflow #1 (AI Breakdown KPI):** n8n mendeteksi `INSERT` baru di `strategic_goals`.
    * **Aksi:** n8n mengambil data, memformat prompt, dan mengirimkannya ke AI (Gemini/OpenAI).
    * AI mengembalikan breakdown KPI dan rekomendasi peran (roles).
    * n8n mem-parsing respons AI dan melakukan `INSERT` beberapa baris ke tabel `proposed_kpis` (satu baris untuk setiap KPI yang disarankan).
    * n8n melakukan `UPDATE` pada `strategic_goals.status` menjadi `"Awaiting Approval"`.

3.  **Approval (Manajer):** Manajer melihat data dari `proposed_kpis` di Dashboard.
    * **Aksi:** Manajer menugaskan karyawan ke setiap KPI (`UPDATE proposed_kpis.assigned_user_id`) dan menyetujui KPI tersebut (`UPDATE proposed_kpis.is_approved = true`).
    * Tombol "Approve" di Dashboard memicu Webhook n8n #2.

4.  **Workflow #2 (AI Daily Task Generator):** Webhook n8n #2 terpicu, membawa data `kpi_id` dan `user_id` yang disetujui.
    * **Aksi:** n8n mengambil detail KPI, memformat prompt AI kedua ("Buatkan checklist harian untuk KPI ini").
    * AI mengembalikan daftar tugas harian (misal: Senin-Jumat).
    * n8n melakukan `INSERT` (batch) puluhan atau ratusan baris tugas ke tabel `daily_tasks` untuk karyawan tersebut selama periode tertentu (misal: 1 bulan ke depan).

5.  **Operasional (Karyawan):** Karyawan login ke Dashboard.
    * **Aksi:** Dashboard melakukan `SELECT * FROM daily_tasks WHERE user_id = [ID_KARYAWAN] AND task_date = [HARI_INI]`.
    * Karyawan memberi centang pada tugas yang selesai.
    * Sistem melakukan `UPDATE daily_tasks SET is_completed = true, completed_at = now() WHERE task_id = [ID_TUGAS]`.

---

## Skema Tabel dan Penjelasan Kolom

### 1. `roles`
**Tujuan:** Tabel Master. Menyimpan daftar peran/jabatan yang ada di tim. Data ini diisi manual oleh Admin dan jarang berubah.

| Nama Kolom | Tipe Data | Deskripsi Kegunaan | Cara Mengisi |
| :--- | :--- | :--- | :--- |
| `role_id` | `SERIAL` | Primary Key. ID unik untuk peran. | **Otomatis** (PostgreSQL). |
| `role_name`| `VARCHAR(100)` | Nama peran/jabatan (WAJIB unik). | **Manual** (Admin). Cth: "Content Creator", "KOL Manager". |
| `description`| `TEXT` | Deskripsi singkat tanggung jawab peran ini. | **Manual** (Admin). Cth: "Membuat konten harian". |

**SQL Schema:**
```sql
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);
```

### 2. `users`
**Tujuan:** Tabel Master. Menyimpan data karyawan/pengguna sistem. Dikelola oleh Admin.

| Nama Kolom | Tipe Data | Deskripsi Kegunaan | Cara Mengisi |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | Primary Key. ID unik untuk karyawan. | **Otomatis** (PostgreSQL, `gen_random_uuid()`). |
| `name` | `VARCHAR(255)`| Nama lengkap karyawan. | **Manual** (Admin). |
| `email` | `VARCHAR(255)`| Email karyawan (WAJIB unik), digunakan untuk login. | **Manual** (Admin). |
| `role_id` | `INTEGER` | Foreign Key yang menghubungkan karyawan ke `roles.role_id`. | **Manual** (Admin) saat mendaftarkan user. |
| `created_at` | `TIMESTAMPTZ`| Cap waktu kapan data karyawan ini dibuat. | **Otomatis** (PostgreSQL, `default now()`). |

**SQL Schema:**
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role_id INTEGER REFERENCES roles(role_id),
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. `strategic_goals`
**Tujuan:** Tabel Transaksi Utama. Ini adalah *input* awal dari Manajer yang berisi target besar dan memicu n8n Workflow #1.

| Nama Kolom | Tipe Data | Deskripsi Kegunaan | Cara Mengisi |
| :--- | :--- | :--- | :--- |
| `goal_id` | `UUID` | Primary Key. ID unik untuk target ini. | **Otomatis** (PostgreSQL, `gen_random_uuid()`). |
| `goal_name`| `VARCHAR(255)`| Nama target. Cth: "Target Impresi 2026 DRW Skincare". | **Manual** (Manajer) via Dashboard. |
| `target_value`| `BIGINT` | Nilai target yang ingin dicapai. Cth: `360000000`. | **Manual** (Manajer) via Dashboard. |
| `start_date` | `DATE` | Tanggal mulai periode target. | **Manual** (Manajer) via Dashboard. |
| `end_date` | `DATE` | Tanggal akhir periode target. | **Manual** (Manajer) via Dashboard. |
| `alokasi_platform`| `JSONB` | Menyimpan alokasi platform. Cth: `[{"platform": "IG @A", "percentage": 40}, ...]`. | **Manual** (Manajer) via Dashboard. |
| `alokasi_sumber` | `JSONB` | Menyimpan alokasi sumber trafik. Cth: `[{"source": "Organik", "percentage": 50}, ...]`. | **Manual** (Manajer) via Dashboard. |
| `status` | `VARCHAR(50)` | Status proses workflow. | **Otomatis/Sistem**. Default: `"Pending"`. Diubah oleh **n8n#1** ke `"Awaiting Approval"`. Diubah oleh **Manajer** ke `"Active"`. |
| `created_at` | `TIMESTAMPTZ`| Cap waktu kapan target ini diinput. | **Otomatis** (PostgreSQL, `default now()`). |

**SQL Schema:**
```sql
CREATE TABLE strategic_goals (
    goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_name VARCHAR(255) NOT NULL,
    target_value BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    alokasi_platform JSONB,
    alokasi_sumber JSONB,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. `proposed_kpis`
**Tujuan:** Tabel Transaksi (Staging). Diisi oleh n8n Workflow #1 (hasil breakdown AI). Data di sini menunggu persetujuan dan penugasan (assignment) dari Manajer.

| Nama Kolom | Tipe Data | Deskripsi Kegunaan | Cara Mengisi |
| :--- | :--- | :--- | :--- |
| `kpi_id` | `UUID` | Primary Key. ID unik untuk KPI yang diusulkan. | **Otomatis** (PostgreSQL, `gen_random_uuid()`). |
| `goal_id` | `UUID` | Foreign Key ke `strategic_goals`. Induk dari KPI ini. | **Otomatis** (oleh **n8n Workflow #1**). |
| `suggested_role_id` | `INTEGER` | Foreign Key ke `roles`. Peran yang disarankan AI. | **Otomatis** (oleh **n8n Workflow #1**). |
| `assigned_user_id`| `UUID` | Foreign Key ke `users`. Karyawan yang ditugaskan. | **Manual** (oleh **Manajer**) via Dashboard. Default `NULL`. |
| `kpi_description` | `TEXT` | Deskripsi KPI. Cth: "Menghasilkan 15 Juta impresi organik bulanan". | **Otomatis** (oleh **n8n Workflow #1**). |
| `target_bulanan`| `BIGINT` | Target angka bulanan untuk KPI ini. Cth: `15000000`. | **Otomatis** (oleh **n8n Workflow #1**). |
| `platform` | `VARCHAR(100)`| Platform spesifik untuk KPI ini. Cth: "TikTok @drw_official". | **Otomatis** (oleh **n8n Workflow #1**). |
| `source` | `VARCHAR(100)`| Sumber trafik spesifik untuk KPI ini. Cth: "Organik". | **Otomatis** (oleh **n8n Workflow #1**). |
| `is_approved` | `BOOLEAN` | Status persetujuan Manajer. | **Otomatis** (Default `false`). Diubah `true` oleh **Manajer** via Dashboard (memicu n8n#2). |

**SQL Schema:**
```sql
CREATE TABLE proposed_kpis (
    kpi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES strategic_goals(goal_id),
    suggested_role_id INTEGER REFERENCES roles(role_id),
    assigned_user_id UUID REFERENCES users(user_id),
    kpi_description TEXT NOT NULL,
    target_bulanan BIGINT,
    platform VARCHAR(100),
    source VARCHAR(100),
    is_approved BOOLEAN DEFAULT false
);
```

### 5. `daily_tasks`
**Tujuan:** Tabel Transaksi Operasional. Menyimpan checklist harian untuk setiap karyawan. Dihasilkan secara otomatis oleh n8n Workflow #2 dan diisi (dicentang) oleh karyawan.

| Nama Kolom | Tipe Data | Deskripsi Kegunaan | Cara Mengisi |
| :--- | :--- | :--- | :--- |
| `task_id` | `UUID` | Primary Key. ID unik untuk setiap item tugas. | **Otomatis** (PostgreSQL, `gen_random_uuid()`). |
| `kpi_id` | `UUID` | Foreign Key ke `proposed_kpis`. Induk dari tugas ini. | **Otomatis** (oleh **n8n Workflow #2**). |
| `user_id` | `UUID` | Foreign Key ke `users`. Karyawan yang harus mengerjakan. | **Otomatis** (oleh **n8n Workflow #2**). |
| `task_description`| `TEXT` | Deskripsi tugas harian. Cth: "Riset 3 tren audio TikTok". | **Otomatis** (oleh **n8n Workflow #2**). |
| `task_date` | `DATE` | Tanggal kapan tugas ini harus dikerjakan. | **Otomatis** (oleh **n8n Workflow #2**). |
| `is_completed` | `BOOLEAN` | Status penyelesaian tugas. | **Manual** (oleh **Karyawan**) via Dashboard. Default `false`. |
| `completed_at` | `TIMESTAMPTZ`| Cap waktu kapan tugas di-centang selesai. | **Otomatis** (Sistem/Backend) saat `is_completed` diubah ke `true`. |

**SQL Schema:**
```sql
CREATE TABLE daily_tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID NOT NULL REFERENCES proposed_kpis(kpi_id),
    user_id UUID NOT NULL REFERENCES users(user_id),
    task_description TEXT NOT NULL,
    task_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ
);
```

---

## Diagram Relasi (Entity Relationship)

```
┌─────────────┐
│    roles    │
│─────────────│
│ role_id (PK)│◄──┐
│ role_name   │   │
│ description │   │
└─────────────┘   │
                  │
                  │ (FK: role_id)
                  │
┌─────────────────┐   │
│     users       │   │
│─────────────────│   │
│ user_id (PK)    │◄──┼────┐
│ name            │   │    │
│ email           │   │    │
│ role_id (FK)    │───┘    │ (FK: user_id)
│ created_at      │        │
└─────────────────┘        │
                           │
┌──────────────────────┐   │
│  strategic_goals     │   │
│──────────────────────│   │
│ goal_id (PK)         │◄──┼────┐
│ goal_name            │   │    │
│ target_value         │   │    │
│ start_date           │   │    │
│ end_date             │   │    │
│ alokasi_platform     │   │    │
│ alokasi_sumber       │   │    │
│ status               │   │    │
│ created_at           │   │    │
└──────────────────────┘   │    │
                           │    │ (FK: goal_id)
                           │    │
┌──────────────────────┐   │    │
│   proposed_kpis      │   │    │
│──────────────────────│   │    │
│ kpi_id (PK)          │◄──┼────┼────┐
│ goal_id (FK)         │───┘    │    │
│ suggested_role_id(FK)│        │    │
│ assigned_user_id(FK) │────────┘    │
│ kpi_description      │             │
│ target_bulanan       │             │
│ platform             │             │
│ source               │             │
│ is_approved          │             │
└──────────────────────┘             │
                                     │ (FK: kpi_id)
                                     │
┌──────────────────────┐             │
│    daily_tasks       │             │
│──────────────────────│             │
│ task_id (PK)         │             │
│ kpi_id (FK)          │─────────────┘
│ user_id (FK)         │
│ task_description     │
│ task_date            │
│ is_completed         │
│ completed_at         │
└──────────────────────┘
```

---

## Contoh Query yang Berguna

### 1. Mendapatkan semua KPI yang belum disetujui untuk suatu Goal
```sql
SELECT 
    pk.kpi_id,
    pk.kpi_description,
    pk.target_bulanan,
    pk.platform,
    r.role_name AS suggested_role
FROM proposed_kpis pk
LEFT JOIN roles r ON pk.suggested_role_id = r.role_id
WHERE pk.goal_id = 'UUID_GOAL' 
  AND pk.is_approved = false;
```

### 2. Mendapatkan tugas harian untuk karyawan tertentu pada tanggal tertentu
```sql
SELECT 
    dt.task_id,
    dt.task_description,
    dt.is_completed,
    pk.kpi_description,
    pk.platform
FROM daily_tasks dt
JOIN proposed_kpis pk ON dt.kpi_id = pk.kpi_id
WHERE dt.user_id = 'UUID_USER' 
  AND dt.task_date = '2026-01-15';
```

### 3. Melihat progress KPI berdasarkan task completion
```sql
SELECT 
    u.name AS karyawan,
    pk.kpi_description,
    COUNT(dt.task_id) AS total_tasks,
    SUM(CASE WHEN dt.is_completed THEN 1 ELSE 0 END) AS completed_tasks,
    ROUND(
        (SUM(CASE WHEN dt.is_completed THEN 1 ELSE 0 END)::DECIMAL / COUNT(dt.task_id)) * 100, 
        2
    ) AS completion_percentage
FROM daily_tasks dt
JOIN proposed_kpis pk ON dt.kpi_id = pk.kpi_id
JOIN users u ON dt.user_id = u.user_id
WHERE pk.goal_id = 'UUID_GOAL'
GROUP BY u.name, pk.kpi_description;
```

### 4. Mendapatkan semua Goals dengan status dan jumlah KPI-nya
```sql
SELECT 
    sg.goal_id,
    sg.goal_name,
    sg.target_value,
    sg.status,
    COUNT(pk.kpi_id) AS total_kpis,
    SUM(CASE WHEN pk.is_approved THEN 1 ELSE 0 END) AS approved_kpis
FROM strategic_goals sg
LEFT JOIN proposed_kpis pk ON sg.goal_id = pk.goal_id
GROUP BY sg.goal_id, sg.goal_name, sg.target_value, sg.status
ORDER BY sg.created_at DESC;
```

---

## Indexes yang Disarankan untuk Performa

```sql
-- Index untuk pencarian user berdasarkan email (login)
CREATE INDEX idx_users_email ON users(email);

-- Index untuk pencarian KPI berdasarkan goal_id
CREATE INDEX idx_proposed_kpis_goal_id ON proposed_kpis(goal_id);

-- Index untuk pencarian KPI yang belum approved
CREATE INDEX idx_proposed_kpis_approved ON proposed_kpis(is_approved);

-- Index untuk pencarian daily tasks berdasarkan user dan tanggal
CREATE INDEX idx_daily_tasks_user_date ON daily_tasks(user_id, task_date);

-- Index untuk pencarian daily tasks berdasarkan KPI
CREATE INDEX idx_daily_tasks_kpi_id ON daily_tasks(kpi_id);

-- Index untuk pencarian tasks yang belum completed
CREATE INDEX idx_daily_tasks_completed ON daily_tasks(is_completed);
```

---

## Catatan Implementasi

### Webhook n8n untuk Trigger Workflow

1. **Trigger untuk Workflow #1 (AI Breakdown KPI):**
   - **Event:** `INSERT` pada tabel `strategic_goals`
   - **Metode:** PostgreSQL Trigger + HTTP Request ke n8n Webhook URL
   - **Data yang dikirim:** `goal_id`, `goal_name`, `target_value`, `alokasi_platform`, `alokasi_sumber`

2. **Trigger untuk Workflow #2 (Generate Daily Tasks):**
   - **Event:** Button "Approve" di Dashboard (atau `UPDATE is_approved = true` pada `proposed_kpis`)
   - **Metode:** HTTP POST dari Backend ke n8n Webhook URL
   - **Data yang dikirim:** `kpi_id`, `user_id`, `kpi_description`, `target_bulanan`, `start_date`, `end_date`

### Validasi Data

- Pastikan `start_date` < `end_date` pada tabel `strategic_goals`
- Pastikan `target_value` dan `target_bulanan` adalah angka positif
- Email pada tabel `users` harus valid dan unique
- Setiap KPI yang di-approve harus memiliki `assigned_user_id`

---

## Versi
- **Versi Database:** 1.0
- **Tanggal:** 2025-10-24
- **Database Engine:** PostgreSQL 14+
