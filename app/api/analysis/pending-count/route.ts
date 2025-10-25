import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Count batches with review_pending status
    const count = await prisma.analysis_batches.count({
      where: {
        status: 'review_pending',
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error counting pending reviews:', error);
    return NextResponse.json({ count: 0 });
  }
}
