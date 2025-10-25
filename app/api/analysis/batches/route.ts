import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build where clause
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    // Fetch all batches with relations
    const batches = await prisma.analysis_batches.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        strategic_goals: {
          select: {
            goal_id: true,
            goal_name: true,
            target_value: true,
            target_unit: true,
          },
        },
        ai_recommended_roles: {
          select: {
            role_recommendation_id: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}
