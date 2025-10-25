import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Role {
  role_id: number;
  role_name: string;
  description?: string | null;
}

interface BusinessUnit {
  bu_id: string;
  name: string;
  description?: string | null;
}

export async function POST() {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Seed Roles
    console.log('📝 Seeding roles...');
    const rolesData = [
      { role_name: 'Manager', description: 'Manager yang bertanggung jawab untuk strategi dan approval' },
      { role_name: 'Content Creator', description: 'Membuat konten visual dan video untuk social media' },
      { role_name: 'Social Media Manager', description: 'Mengelola akun social media dan engagement' },
      { role_name: 'Graphic Designer', description: 'Desain grafis untuk kampanye marketing' },
      { role_name: 'Video Editor', description: 'Edit video untuk konten TikTok, Reels, dan YouTube' },
      { role_name: 'Copywriter', description: 'Menulis caption dan copy untuk marketing' },
    ];

    for (const roleData of rolesData) {
      await prisma.roles.upsert({
        where: { role_name: roleData.role_name },
        update: {},
        create: roleData,
      });
    }

    // 2. Seed Business Units
    console.log('🏢 Seeding business units...');
    const businessUnitsData = [
      { name: 'DRW Estetika', description: 'Brand skincare DRW - Instagram & TikTok' },
      { name: 'DRW Clinic', description: 'Klinik kecantikan DRW' },
      { name: 'Marketing', description: 'Tim marketing general' },
    ];

    const businessUnits: any[] = [];
    for (const buData of businessUnitsData) {
      // Find existing or create new
      let bu = await prisma.business_units.findFirst({
        where: { name: buData.name },
      });

      if (!bu) {
        bu = await prisma.business_units.create({
          data: buData,
        });
      }

      businessUnits.push(bu);
    }

    // 3. Seed Users
    console.log('👥 Seeding users...');    // Get all roles
    const roles: Role[] = await prisma.roles.findMany();
    const managerRole = roles.find((r: Role) => r.role_name === 'Manager');
    const contentCreatorRole = roles.find((r: Role) => r.role_name === 'Content Creator');
    const socialMediaRole = roles.find((r: Role) => r.role_name === 'Social Media Manager');
    const designerRole = roles.find((r: Role) => r.role_name === 'Graphic Designer');
    const videoEditorRole = roles.find((r: Role) => r.role_name === 'Video Editor');
    const copywriterRole = roles.find((r: Role) => r.role_name === 'Copywriter');

    const drwEstetika = businessUnits.find((bu: BusinessUnit) => bu.name === 'DRW Estetika');
    const drwClinic = businessUnits.find((bu: BusinessUnit) => bu.name === 'DRW Clinic');
    const marketing = businessUnits.find((bu: BusinessUnit) => bu.name === 'Marketing');

    const usersData = [
      // Managers
      {
        name: 'Budi Santoso',
        email: 'manager.drw@example.com',
        role_id: managerRole?.role_id,
        business_unit_id: drwEstetika?.bu_id,
      },
      {
        name: 'Siti Rahma',
        email: 'manager.clinic@example.com',
        role_id: managerRole?.role_id,
        business_unit_id: drwClinic?.bu_id,
      },
      // Content Creators
      {
        name: 'Andi Wijaya',
        email: 'creator1@example.com',
        role_id: contentCreatorRole?.role_id,
        business_unit_id: drwEstetika?.bu_id,
      },
      {
        name: 'Dewi Lestari',
        email: 'creator2@example.com',
        role_id: contentCreatorRole?.role_id,
        business_unit_id: drwEstetika?.bu_id,
      },
      // Social Media Managers
      {
        name: 'Rini Puspita',
        email: 'socmed.instagram@example.com',
        role_id: socialMediaRole?.role_id,
        business_unit_id: drwEstetika?.bu_id,
      },
      {
        name: 'Fajar Nugroho',
        email: 'socmed.tiktok@example.com',
        role_id: socialMediaRole?.role_id,
        business_unit_id: drwEstetika?.bu_id,
      },
      // Graphic Designer
      {
        name: 'Linda Kartika',
        email: 'designer@example.com',
        role_id: designerRole?.role_id,
        business_unit_id: marketing?.bu_id,
      },
      // Video Editor
      {
        name: 'Eko Prasetyo',
        email: 'videoeditor@example.com',
        role_id: videoEditorRole?.role_id,
        business_unit_id: drwEstetika?.bu_id,
      },
      // Copywriter
      {
        name: 'Maya Sari',
        email: 'copywriter@example.com',
        role_id: copywriterRole?.role_id,
        business_unit_id: marketing?.bu_id,
      },
    ];

    for (const userData of usersData) {
      await prisma.users.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
      });
    }

    const counts = {
      roles: await prisma.roles.count(),
      businessUnits: await prisma.business_units.count(),
      users: await prisma.users.count(),
    };

    console.log('🎉 Database seeding completed!');
    console.log('📊 Summary:', counts);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      counts,
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
