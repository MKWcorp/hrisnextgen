import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all batches with review_pending status
    const batches = await prisma.analysis_batches.findMany({
      where: {
        status: 'review_pending',
      },
      include: {
        business_units: true,
        users: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching review batches:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    // Return empty array instead of error object to prevent frontend crashes
    return NextResponse.json([]);
  }
}
