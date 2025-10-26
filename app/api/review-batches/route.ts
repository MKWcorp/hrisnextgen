import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {    // Fetch batches for review dashboard:
    // 1. review_pending - fresh from n8n, needs review
    // 2. kpi_loading - AI workflow #2 is processing KPI breakdown
    // 3. KPI_Assignment_Pending - AI workflow completed, can view results
    // 4. Analyzing - n8n might still be processing but has data
    const batches = await prisma.analysis_batches.findMany({
      where: {
        status: {
          in: ['review_pending', 'kpi_loading', 'KPI_Assignment_Pending', 'Analyzing'],
        },
        // Only show batches that have AI recommended roles (means n8n has processed it)
        ai_recommended_roles: {
          some: {},
        },
      },
      include: {
        business_units: {
          select: {
            bu_id: true,
            name: true,
          },
        },
        users: {
          select: {
            user_id: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      batches: batches,
      count: batches.length,
    });
  } catch (error) {
    console.error('Error fetching review batches:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    // Return empty array instead of error object to prevent frontend crashes
    return NextResponse.json({ batches: [], count: 0 });
  }
}
