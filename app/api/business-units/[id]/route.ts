import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const creatorId = searchParams.get('creator_id');

    // Fetch business unit details
    const businessUnit = await prisma.business_units.findUnique({
      where: { bu_id: params.id },
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
