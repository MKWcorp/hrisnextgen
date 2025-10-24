import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate status
    const validStatuses = ['pending_approval', 'approved', 'rejected'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const breakdown = await prisma.proposed_breakdowns.update({
      where: { breakdown_id: id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.value !== undefined && { value: BigInt(body.value) }),
        ...(body.status && { status: body.status }),
      },
      include: {
        strategic_goals: true,
      },
    });

    return NextResponse.json({
      ...breakdown,
      value: breakdown.value.toString(),
    });
  } catch (error) {
    console.error('Error updating breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to update breakdown' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.proposed_breakdowns.delete({
      where: { breakdown_id: id },
    });

    return NextResponse.json(
      { message: 'Breakdown deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to delete breakdown' },
      { status: 500 }
    );
  }
}
