import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;
    
    const searchParams = request.nextUrl.searchParams;
    const creatorId = searchParams.get('creator_id');

    // Fetch business unit details
    const businessUnit = await prisma.business_units.findUnique({
      where: { bu_id: id },
    });

    if (!businessUnit) {
      return NextResponse.json(
        { error: 'Business unit not found' },
        { status: 404 }
      );
    }

    // If creator_id provided, fetch creator details
    let creatorInfo = null;
    if (creatorId) {
      const creator = await prisma.users.findUnique({
        where: { user_id: creatorId },
        include: {
          roles: true,
        },
      });

      if (creator) {
        creatorInfo = {
          creator_name: creator.name,
          creator_email: creator.email,
          creator_role: creator.roles?.role_name || 'Unknown',
          role_description: creator.roles?.description || null,
        };
      }
    }

    return NextResponse.json({
      business_unit_id: businessUnit.bu_id,
      business_unit_name: businessUnit.name,
      business_unit_description: businessUnit.description,
      ...creatorInfo,
    });
  } catch (error) {
    console.error('Error fetching business unit details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business unit details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Business unit name is required' },
        { status: 400 }
      );
    }

    const businessUnit = await prisma.business_units.update({
      where: { bu_id: id },
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(businessUnit);
  } catch (error) {
    console.error('Error updating business unit:', error);
    return NextResponse.json(
      { error: 'Failed to update business unit' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if business unit is being used by any users
    const usersCount = await prisma.users.count({
      where: { business_unit_id: id },
    });

    if (usersCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete business unit. It is being used by ${usersCount} user(s). Please reassign or delete those users first.` },
        { status: 400 }
      );
    }

    await prisma.business_units.delete({
      where: { bu_id: id },
    });

    return NextResponse.json({ message: 'Business unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting business unit:', error);
    return NextResponse.json(
      { error: 'Failed to delete business unit' },
      { status: 500 }
    );
  }
}
