-- Seed database dengan data master
-- Jalankan dengan: psql -d your_database_name -f prisma/seed.sql

-- 1. Insert Roles
INSERT INTO roles (role_name, description) VALUES
  ('Manager', 'Manager yang bertanggung jawab untuk strategi dan approval'),
  ('Content Creator', 'Membuat konten visual dan video untuk social media'),
  ('Social Media Manager', 'Mengelola akun social media dan engagement'),
  ('Graphic Designer', 'Desain grafis untuk kampanye marketing'),
  ('Video Editor', 'Edit video untuk konten TikTok, Reels, dan YouTube'),
  ('Copywriter', 'Menulis caption dan copy untuk marketing')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Insert Business Units
INSERT INTO business_units (name, description) VALUES
  ('DRW Estetika', 'Brand skincare DRW - Instagram & TikTok'),
  ('DRW Clinic', 'Klinik kecantikan DRW'),
  ('Marketing', 'Tim marketing general')
ON CONFLICT DO NOTHING;

-- 3. Insert Users
-- Get IDs from roles and business_units
WITH role_ids AS (
  SELECT role_id, role_name FROM roles
),
bu_ids AS (
  SELECT bu_id, name FROM business_units
)
INSERT INTO users (name, email, role_id, business_unit_id) VALUES
  -- Managers
  (
    'Budi Santoso',
    'manager.drw@example.com',
    (SELECT role_id FROM role_ids WHERE role_name = 'Manager'),
    (SELECT bu_id FROM bu_ids WHERE name = 'DRW Estetika')
  ),
  (
    'Siti Rahma',
    'manager.clinic@example.com',
    (SELECT role_id FROM role_ids WHERE role_name = 'Manager'),
    (SELECT bu_id FROM bu_ids WHERE name = 'DRW Clinic')
  ),
  
  -- Content Creators
  (
    'Andi Wijaya',
    'creator1@example.com',
    (SELECT role_id FROM role_ids WHERE role_name = 'Content Creator'),
    (SELECT bu_id FROM bu_ids WHERE name = 'DRW Estetika')
  ),
  (
    'Dewi Lestari',
    'creator2@example.com',
    (SELECT role_id FROM role_ids WHERE role_name = 'Content Creator'),
    (SELECT bu_id FROM bu_ids WHERE name = 'DRW Estetika')
  ),
  
  -- Social Media Managers
  (
    'Rini Puspita',
    'socmed.instagram@example.com',
    (SELECT role_id FROM role_ids WHERE role_name = 'Social Media Manager'),
    (SELECT bu_id FROM bu_ids WHERE name = 'DRW Estetika')
  ),
  (
    'Fajar Nugroho',
    'socmed.tiktok@example.com',
    (SELECT role_id FROM role_ids WHERE role_name = 'Social Media Manager'),
    (SELECT bu_id FROM bu_ids WHERE name = 'DRW Estetika')
  ),
  
  -- Graphic Designer
  (
    'Linda Kartika',
    'designer@example.com',
    (SELECT role_id FROM role_ids WHERE role_name = 'Graphic Designer'),
    (SELECT bu_id FROM bu_ids WHERE name = 'Marketing')
  ),
  
  -- Video Editor
  (
    'Eko Prasetyo',
    'videoeditor@example.com',
    (SELECT role_id FROM role_ids WHERE role_name = 'Video Editor'),
    (SELECT bu_id FROM bu_ids WHERE name = 'DRW Estetika')
  ),
  
  -- Copywriter
  (
    'Maya Sari',
    'copywriter@example.com',
    (SELECT role_id FROM role_ids WHERE role_name = 'Copywriter'),
    (SELECT bu_id FROM bu_ids WHERE name = 'Marketing')
  )
ON CONFLICT (email) DO NOTHING;

-- Show results
SELECT 'Seeding completed!' AS message;
SELECT COUNT(*) AS total_roles FROM roles;
SELECT COUNT(*) AS total_business_units FROM business_units;
SELECT COUNT(*) AS total_users FROM users;
