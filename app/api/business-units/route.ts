import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const businessUnits = await prisma.business_units.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(businessUnits);
  } catch (error) {
    console.error('Error fetching business units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business units' },
      { status: 500 }
    );
  }
}
