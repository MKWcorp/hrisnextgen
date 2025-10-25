import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Roles
  console.log('📝 Seeding roles...');
  const roles = await Promise.all([
    prisma.roles.upsert({
      where: { role_name: 'Manager' },
      update: {},
      create: {
        role_name: 'Manager',
        description: 'Manager yang bertanggung jawab untuk strategi dan approval',
      },
    }),
    prisma.roles.upsert({
      where: { role_name: 'Content Creator' },
      update: {},
      create: {
        role_name: 'Content Creator',
        description: 'Membuat konten visual dan video untuk social media',
      },
    }),
    prisma.roles.upsert({
      where: { role_name: 'Social Media Manager' },
      update: {},
      create: {
        role_name: 'Social Media Manager',
        description: 'Mengelola akun social media dan engagement',
      },
    }),
    prisma.roles.upsert({
      where: { role_name: 'Graphic Designer' },
      update: {},
      create: {
        role_name: 'Graphic Designer',
        description: 'Desain grafis untuk kampanye marketing',
      },
    }),
    prisma.roles.upsert({
      where: { role_name: 'Video Editor' },
      update: {},
      create: {
        role_name: 'Video Editor',
        description: 'Edit video untuk konten TikTok, Reels, dan YouTube',
      },
    }),
    prisma.roles.upsert({
      where: { role_name: 'Copywriter' },
      update: {},
      create: {
        role_name: 'Copywriter',
        description: 'Menulis caption dan copy untuk marketing',
      },
    }),
  ]);

  console.log(`✅ Created ${roles.length} roles`);

  // 2. Seed Business Units
  console.log('🏢 Seeding business units...');
  const businessUnits = await Promise.all([
    prisma.business_units.upsert({
      where: { name: 'DRW Estetika' },
      update: {},
      create: {
        name: 'DRW Estetika',
        description: 'Brand skincare DRW - Instagram & TikTok',
      },
    }),
    prisma.business_units.upsert({
      where: { name: 'DRW Clinic' },
      update: {},
      create: {
        name: 'DRW Clinic',
        description: 'Klinik kecantikan DRW',
      },
    }),
    prisma.business_units.upsert({
      where: { name: 'Marketing' },
      update: {},
      create: {
        name: 'Marketing',
        description: 'Tim marketing general',
      },
    }),
  ]);

  console.log(`✅ Created ${businessUnits.length} business units`);

  // 3. Seed Users (with roles)
  console.log('👥 Seeding users...');

  // Get role IDs
  const managerRole = roles.find((r) => r.role_name === 'Manager')!;
  const contentCreatorRole = roles.find((r) => r.role_name === 'Content Creator')!;
  const socialMediaRole = roles.find((r) => r.role_name === 'Social Media Manager')!;
  const designerRole = roles.find((r) => r.role_name === 'Graphic Designer')!;
  const videoEditorRole = roles.find((r) => r.role_name === 'Video Editor')!;
  const copywriterRole = roles.find((r) => r.role_name === 'Copywriter')!;

  // Get business unit IDs
  const drwEstetika = businessUnits.find((bu) => bu.name === 'DRW Estetika')!;
  const drwClinic = businessUnits.find((bu) => bu.name === 'DRW Clinic')!;
  const marketing = businessUnits.find((bu) => bu.name === 'Marketing')!;

  const users = await Promise.all([
    // Managers
    prisma.users.upsert({
      where: { email: 'manager.drw@example.com' },
      update: {},
      create: {
        name: 'Budi Santoso',
        email: 'manager.drw@example.com',
        role_id: managerRole.role_id,
        business_unit_id: drwEstetika.bu_id,
      },
    }),
    prisma.users.upsert({
      where: { email: 'manager.clinic@example.com' },
      update: {},
      create: {
        name: 'Siti Rahma',
        email: 'manager.clinic@example.com',
        role_id: managerRole.role_id,
        business_unit_id: drwClinic.bu_id,
      },
    }),

    // Content Creators
    prisma.users.upsert({
      where: { email: 'creator1@example.com' },
      update: {},
      create: {
        name: 'Andi Wijaya',
        email: 'creator1@example.com',
        role_id: contentCreatorRole.role_id,
        business_unit_id: drwEstetika.bu_id,
      },
    }),
    prisma.users.upsert({
      where: { email: 'creator2@example.com' },
      update: {},
      create: {
        name: 'Dewi Lestari',
        email: 'creator2@example.com',
        role_id: contentCreatorRole.role_id,
        business_unit_id: drwEstetika.bu_id,
      },
    }),

    // Social Media Managers
    prisma.users.upsert({
      where: { email: 'socmed.instagram@example.com' },
      update: {},
      create: {
        name: 'Rini Puspita',
        email: 'socmed.instagram@example.com',
        role_id: socialMediaRole.role_id,
        business_unit_id: drwEstetika.bu_id,
      },
    }),
    prisma.users.upsert({
      where: { email: 'socmed.tiktok@example.com' },
      update: {},
      create: {
        name: 'Fajar Nugroho',
        email: 'socmed.tiktok@example.com',
        role_id: socialMediaRole.role_id,
        business_unit_id: drwEstetika.bu_id,
      },
    }),

    // Graphic Designer
    prisma.users.upsert({
      where: { email: 'designer@example.com' },
      update: {},
      create: {
        name: 'Linda Kartika',
        email: 'designer@example.com',
        role_id: designerRole.role_id,
        business_unit_id: marketing.bu_id,
      },
    }),

    // Video Editor
    prisma.users.upsert({
      where: { email: 'videoeditor@example.com' },
      update: {},
      create: {
        name: 'Eko Prasetyo',
        email: 'videoeditor@example.com',
        role_id: videoEditorRole.role_id,
        business_unit_id: drwEstetika.bu_id,
      },
    }),

    // Copywriter
    prisma.users.upsert({
      where: { email: 'copywriter@example.com' },
      update: {},
      create: {
        name: 'Maya Sari',
        email: 'copywriter@example.com',
        role_id: copywriterRole.role_id,
        business_unit_id: marketing.bu_id,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Summary
  console.log('\n🎉 Database seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`   Roles: ${roles.length}`);
  console.log(`   Business Units: ${businessUnits.length}`);
  console.log(`   Users: ${users.length}`);
  console.log('\n🔑 Sample Login Credentials:');
  console.log('   Manager: manager.drw@example.com');
  console.log('   Content Creator: creator1@example.com');
  console.log('   Social Media Manager: socmed.instagram@example.com');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
