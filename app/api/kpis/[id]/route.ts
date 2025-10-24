import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateKPIInput } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateKPIInput = await request.json();

    const kpi = await prisma.proposed_kpis.update({
      where: { kpi_id: id },
      data: {
        assigned_user_id: body.assigned_user_id,
        is_approved: body.is_approved,
      },
      include: {
        users: true,
        roles: true,
        strategic_goals: true,
      },
    });

    return NextResponse.json(kpi);
  } catch (error) {
    console.error('Error updating KPI:', error);
    return NextResponse.json(
      { error: 'Failed to update KPI' },
      { status: 500 }
    );
  }
}
