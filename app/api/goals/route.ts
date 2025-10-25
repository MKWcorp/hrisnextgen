import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const batchId = searchParams.get('batch_id');

    const goals = await prisma.strategic_goals.findMany({
      where: batchId ? { batch_id: batchId } : undefined,
      include: {
        business_units: true,
        proposed_kpis: {
          include: {
            users: true,
            roles: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Serialize BigInt fields
    const serializedGoals = goals.map((goal) => ({
      ...goal,
      target_value: goal.target_value.toString(),
      proposed_kpis: goal.proposed_kpis.map((kpi) => ({
        ...kpi,
        target_bulanan: kpi.target_bulanan?.toString(),
      })),
    }));

    return NextResponse.json(serializedGoals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

interface CreateGoalRequest {
  goal_name: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  business_unit_id: string;
  created_by_role_id: number;
  goal_breakdown?: Array<{ name: string; value: number }>;
}

interface CreateGoalsRequest {
  goals: Array<{
    goal_name: string;
    target_value: string;
    target_unit?: string;
  }>;
  dateRange: {
    start_date: string;
    end_date: string;
  };
  userId: string;
  businessUnitId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is the new format (multiple goals with user)
    if (body.goals && body.dateRange && body.userId !== undefined) {
      const goalsRequest = body as CreateGoalsRequest;

      if (!goalsRequest.goals || goalsRequest.goals.length === 0) {
        return NextResponse.json(
          { error: 'At least one goal is required' },
          { status: 400 }
        );
      }

      if (!goalsRequest.dateRange.start_date || !goalsRequest.dateRange.end_date) {
        return NextResponse.json(
          { error: 'Start date and end date are required' },
          { status: 400 }
        );
      }

      if (!goalsRequest.businessUnitId) {
        return NextResponse.json(
          { error: 'Business unit selection is required' },
          { status: 400 }
        );
      }

      if (!goalsRequest.userId) {
        return NextResponse.json(
          { error: 'User selection is required' },
          { status: 400 }
        );
      }

      // Find the selected user
      const selectedUser = await prisma.users.findUnique({
        where: { user_id: goalsRequest.userId },
      });

      if (!selectedUser) {
        return NextResponse.json(
          { error: 'Selected user not found' },
          { status: 400 }
        );
      }

      const createdGoals = [];

      // Get business unit details for n8n payload
      const businessUnit = await prisma.business_units.findUnique({
        where: { bu_id: goalsRequest.businessUnitId },
      });

      for (const goalData of goalsRequest.goals) {
        if (!goalData.goal_name || !goalData.target_value) {
          return NextResponse.json(
            { error: 'Goal name and target value are required for all goals' },
            { status: 400 }
          );
        }

        // Parse the formatted number (remove dots)
        const cleanTargetValue = goalData.target_value.replace(/\./g, '');
        const targetValue = parseInt(cleanTargetValue, 10);

        if (isNaN(targetValue)) {
          return NextResponse.json(
            { error: 'Invalid target value format' },
            { status: 400 }
          );
        }

        const goal = await prisma.strategic_goals.create({
          data: {
            goal_name: goalData.goal_name,
            target_value: BigInt(targetValue),
            target_unit: goalData.target_unit || 'units',
            start_date: new Date(goalsRequest.dateRange.start_date),
            end_date: new Date(goalsRequest.dateRange.end_date),
            business_unit_id: goalsRequest.businessUnitId,
            created_by_user_id: selectedUser.user_id,
          },
        });

        createdGoals.push({
          ...goal,
          target_value: goal.target_value.toString(),
        });

        // No webhook trigger on create - use "Rekomendasi AI" button instead
      }

      return NextResponse.json(
        { 
          goals: createdGoals,
          message: 'Goals created successfully',
        },
        { status: 201 }
      );
    }

    // Handle the old format (single goal creation)
    const singleGoalRequest = body as CreateGoalRequest;

    if (!singleGoalRequest.goal_name || !singleGoalRequest.target_value || !singleGoalRequest.target_unit || !singleGoalRequest.start_date || !singleGoalRequest.end_date || !singleGoalRequest.business_unit_id || !singleGoalRequest.created_by_role_id) {
      return NextResponse.json(
        { error: 'Missing required fields: goal_name, target_value, target_unit, start_date, end_date, business_unit_id, created_by_role_id' },
        { status: 400 }
      );
    }

    const [businessUnit, userWithRole] = await Promise.all([
      prisma.business_units.findUnique({
        where: { bu_id: singleGoalRequest.business_unit_id },
      }),
      prisma.users.findFirst({
        where: { role_id: singleGoalRequest.created_by_role_id },
      }),
    ]);

    if (!businessUnit) {
      return NextResponse.json(
        { error: 'Business unit not found' },
        { status: 400 }
      );
    }

    if (!userWithRole) {
      return NextResponse.json(
        { error: 'No user found with the selected role' },
        { status: 400 }
      );
    }

    const goal = await prisma.strategic_goals.create({
      data: {
        goal_name: singleGoalRequest.goal_name,
        target_value: BigInt(singleGoalRequest.target_value),
        target_unit: singleGoalRequest.target_unit,
        start_date: new Date(singleGoalRequest.start_date),
        end_date: new Date(singleGoalRequest.end_date),
        business_unit_id: singleGoalRequest.business_unit_id,
        created_by_user_id: userWithRole.user_id,
      },
    });

    // No webhook trigger on create - use "Rekomendasi AI" button instead

    return NextResponse.json(
      { 
        ...goal, 
        target_value: goal.target_value.toString(),
        message: 'Goal created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating goal:', error);
    
    if (error instanceof Error && error.message.includes('business_unit')) {
      return NextResponse.json(
        { error: 'Business unit not found or invalid' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
}
