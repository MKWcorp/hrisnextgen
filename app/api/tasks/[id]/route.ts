import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateTaskInput } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateTaskInput = await request.json();

    const task = await prisma.daily_tasks.update({
      where: { task_id: id },
      data: {
        is_completed: body.is_completed,
        completed_at: body.is_completed ? new Date() : null,
      },
      include: {
        users: true,
        proposed_kpis: {
          include: {
            strategic_goals: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
