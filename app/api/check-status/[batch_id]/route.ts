import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { batch_id: string } }
) {
  try {
    const { batch_id } = params;

    // Get analysis batch status
    const batch = await prisma.analysis_batches.findUnique({
      where: {
        batch_id: batch_id,
      },
      select: {
        batch_id: true,
        batch_name: true,
        status: true,
        created_at: true,
        ai_team_recommendation: true,
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      batch_id: batch.batch_id,
      batch_name: batch.batch_name,
      status: batch.status,
      created_at: batch.created_at,
      has_recommendation: batch.ai_team_recommendation !== null,
    });
  } catch (error) {
    console.error('Error checking batch status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
