import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const goalId = searchParams.get('goal_id');
    const isApproved = searchParams.get('is_approved');    const kpis = await prisma.proposed_kpis.findMany({
      where: {
        ...(goalId && { goal_id: goalId }),
        ...(isApproved !== null && { is_approved: isApproved === 'true' }),
      },
      include: {
        assigned_user: true,
        ai_recommended_roles: true,
        proposed_breakdowns: true,
      },
      orderBy: {
        kpi_id: 'asc',
      },
    });

    return NextResponse.json(kpis);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    );
  }
}
