import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface KPIItem {
  suggested_role_id: number;
  kpi_description: string;
  target_bulanan: number;
  platform?: string;
  source?: string;
}

interface KPIGenerationPayload {
  goal_id: string;
  kpis: KPIItem[];
}

interface CreatedKPI {
  kpi_id: string;
  goal_id: string;
  suggested_role_id?: number | null;
  kpi_description: string;
  target_bulanan?: bigint | null;
  platform?: string | null;
  source?: string | null;
  is_approved: boolean;
  assigned_user_id?: string | null;
  created_at: Date;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: KPIGenerationPayload = await request.json();

    // Validate payload
    if (!body.goal_id || !body.kpis || body.kpis.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: goal_id and kpis are required' },
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

    // Insert all KPIs
    const createdKPIs = await prisma.$transaction(
      body.kpis.map((kpi) =>
        prisma.proposed_kpis.create({          data: {
            goal_id: body.goal_id,
            suggested_role_id: kpi.suggested_role_id,
            kpi_description: kpi.kpi_description,
            target_bulanan: kpi.target_bulanan ? BigInt(kpi.target_bulanan) : null,
            platform: kpi.platform || null,
            source: kpi.source || null,
            is_approved: false,
            breakdown_id: null,
            role_recommendation_id: null,
          },
        })
      )
    );    return NextResponse.json(
      {
        message: 'KPIs created successfully',
        count: createdKPIs.length,
        kpis: createdKPIs.map((k: typeof createdKPIs[0]) => ({
          ...k,
          target_bulanan: k.target_bulanan?.toString(),
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating KPIs:', error);
    return NextResponse.json(
      { error: 'Failed to create KPIs' },
      { status: 500 }
    );
  }
}
