import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TaskItem {
  task_date: string;
  task_description: string;
}

interface DailyTasksPayload {
  kpi_id: string;
  user_id: string;
  tasks: TaskItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body: DailyTasksPayload = await request.json();

    // Validate payload
    if (!body.kpi_id || !body.user_id || !body.tasks || body.tasks.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: kpi_id, user_id, and tasks are required' },
        { status: 400 }
      );
    }    // Verify KPI exists and is approved
    const kpi = await prisma.proposed_kpis.findUnique({
      where: { kpi_id: body.kpi_id },
      include: { 
        ai_recommended_roles: true,
        proposed_breakdowns: true,
      },
    });

    if (!kpi) {
      return NextResponse.json(
        { error: 'KPI not found' },
        { status: 404 }
      );
    }

    if (!kpi.is_approved) {
      return NextResponse.json(
        { error: 'KPI must be approved before generating tasks' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { user_id: body.user_id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Insert all tasks
    const createdTasks = await prisma.$transaction(
      body.tasks.map((task) =>
        prisma.daily_tasks.create({
          data: {
            kpi_id: body.kpi_id,
            user_id: body.user_id,
            task_description: task.task_description,
            task_date: new Date(task.task_date),
            is_completed: false,
          },
        })
      )
    );

    return NextResponse.json(
      {
        message: 'Daily tasks created successfully',
        count: createdTasks.length,
        tasks: createdTasks,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating daily tasks:', error);
    return NextResponse.json(
      { error: 'Failed to create daily tasks' },
      { status: 500 }
    );
  }
}
