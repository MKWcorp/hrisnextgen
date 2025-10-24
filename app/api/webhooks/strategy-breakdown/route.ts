import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface BreakdownItem {
  name: string;
  value: number;
}

interface StrategyBreakdownPayload {
  goal_id: string;
  breakdowns: BreakdownItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body: StrategyBreakdownPayload = await request.json();

    // Validate payload
    if (!body.goal_id || !body.breakdowns || body.breakdowns.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: goal_id and breakdowns are required' },
        { status: 400 }
      );
    }

    // Verify goal exists
    const goal = await prisma.strategic_goals.findUnique({
      where: { goal_id: body.goal_id },
    });

    if (!goal) {
      return NextResponse.json(
        { error: 'Strategic goal not found' },
        { status: 404 }
      );
    }

    // Insert all breakdowns
    const createdBreakdowns = await prisma.$transaction(
      body.breakdowns.map((breakdown) =>
        prisma.proposed_breakdowns.create({
          data: {
            goal_id: body.goal_id,
            name: breakdown.name,
            value: BigInt(breakdown.value),
            status: 'pending_approval',
          },
        })
      )
    );

    // Update goal status
    await prisma.strategic_goals.update({
      where: { goal_id: body.goal_id },
      data: { status: 'Awaiting Breakdown Approval' },
    });

    return NextResponse.json(
      {
        message: 'Strategy breakdowns created successfully',
        count: createdBreakdowns.length,
        breakdowns: createdBreakdowns.map((b) => ({
          ...b,
          value: b.value.toString(),
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating strategy breakdowns:', error);
    return NextResponse.json(
      { error: 'Failed to create strategy breakdowns' },
      { status: 500 }
    );
  }
}
