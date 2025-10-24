import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const goalId = searchParams.get('goal_id');
    const status = searchParams.get('status');

    const breakdowns = await prisma.proposed_breakdowns.findMany({
      where: {
        ...(goalId && { goal_id: goalId }),
        ...(status && { status }),
      },
      include: {
        strategic_goals: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedBreakdowns = breakdowns.map((breakdown) => ({
      ...breakdown,
      value: breakdown.value.toString(),
    }));

    return NextResponse.json(serializedBreakdowns);
  } catch (error) {
    console.error('Error fetching breakdowns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch breakdowns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.goal_id || !body.name || body.value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: goal_id, name, value' },
        { status: 400 }
      );
    }

    const breakdown = await prisma.proposed_breakdowns.create({
      data: {
        goal_id: body.goal_id,
        name: body.name,
        value: BigInt(body.value),
        status: body.status || 'pending_approval',
      },
    });

    return NextResponse.json(
      {
        ...breakdown,
        value: breakdown.value.toString(),
        message: 'Breakdown created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to create breakdown' },
      { status: 500 }
    );
  }
}
