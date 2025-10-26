import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateDailyTaskInput } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const taskDate = searchParams.get('task_date');
    const isCompleted = searchParams.get('is_completed');

    const tasks = await prisma.daily_tasks.findMany({
      where: {
        ...(userId && { user_id: userId }),
        ...(taskDate && { task_date: new Date(taskDate) }),
        ...(isCompleted !== null && { is_completed: isCompleted === 'true' }),
      },      include: {
        users: true,
        proposed_kpis: {
          include: {
            ai_recommended_roles: true,
            proposed_breakdowns: true,
          },
        },
      },
      orderBy: {
        task_date: 'asc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateDailyTaskInput = await request.json();

    const task = await prisma.daily_tasks.create({
      data: {
        kpi_id: body.kpi_id,
        user_id: body.user_id,
        task_description: body.task_description,
        task_date: new Date(body.task_date),
        is_completed: false,
      },
      include: {
        users: true,
        proposed_kpis: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
