import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface StrategicGoal {
  goal_id: string;
  goal_name: string;
  target_value: bigint;
  target_unit?: string | null;
  start_date: Date;
  end_date: Date;
  batch_id?: string | null;
  business_unit_id?: string | null;
  created_by_user_id?: string | null;
  created_at?: Date | null;
  business_units?: {
    name: string;
    description?: string | null;
  };
  users?: {
    name: string;
    roles?: {
      role_name: string;
    } | null;
  };
  proposed_kpis?: Array<{
    is_approved: boolean;
  }>;
}

export async function POST(request: NextRequest) {  try {
    // Fetch all strategic goals with related data
    const goals = await prisma.strategic_goals.findMany({
      include: {
        business_units: true,
        users: {
          include: {
            roles: true,
          },
        },
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

    if (goals.length === 0) {
      return NextResponse.json(
        { error: 'No goals found to analyze' },
        { status: 400 }
      );
    }

    // Generate batch_id for this analysis
    const batchName = `Portfolio Analysis - ${new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    // Get first goal's creator and business unit for batch record
    const firstGoal = goals[0];
    const createdByUserId = firstGoal.created_by_user_id;
    const businessUnitId = firstGoal.business_unit_id;

    // Create analysis_batch record
    const analysisBatch = await prisma.analysis_batches.create({
      data: {
        batch_name: batchName,
        created_by_user_id: createdByUserId,
        business_unit_id: businessUnitId,
        status: 'Analyzing',
      },
    });

    const batchId = analysisBatch.batch_id;
    console.log(`✅ Created analysis batch: ${batchId} (${batchName})`);    // Update all goals with this batch_id
    const updateResult = await prisma.strategic_goals.updateMany({
      where: {
        goal_id: {
          in: goals.map((g) => g.goal_id),
        },
      },
      data: {
        batch_id: batchId,
      },
    });

    console.log(`✅ Updated ${updateResult.count} goals with batch_id: ${batchId}`);

    // Prepare analysis payload for n8n
    const analysisPayload = {
      analysis_type: 'portfolio_review',
      batch_id: batchId,
      total_goals: goals.length,      goals_summary: goals.map((goal: typeof goals[0]) => {
        // Calculate duration in months
        const startDate = new Date(goal.start_date);
        const endDate = new Date(goal.end_date);
        const durationMonths = Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );

        return {
          goal_id: goal.goal_id,
          goal_name: goal.goal_name,
          target_value: goal.target_value.toString(),
          target_unit: goal.target_unit,
          business_unit: goal.business_units?.name || 'Unknown',
          business_unit_description: goal.business_units?.description || '',
          created_by: goal.users?.name || 'Unknown',
          creator_role: goal.users?.roles?.role_name || 'Unknown',          start_date: goal.start_date.toISOString().split('T')[0], // Format: YYYY-MM-DD
          end_date: goal.end_date.toISOString().split('T')[0],
          duration_months: durationMonths,
          kpi_count: goal.proposed_kpis?.length ?? 0,
          kpi_approved: goal.proposed_kpis?.filter((kpi: typeof goal.proposed_kpis[0]) => kpi.is_approved).length ?? 0,
        };
      }),
      analysis_request: {
        requested_at: new Date().toISOString(),
        analysis_areas: [
          'goal_overlap',
          'resource_allocation',
          'priority_recommendations',
          'gap_analysis',
          'timeline_conflicts',
          'team_capacity',
        ],
      },
    };

    // Trigger n8n Workflow for Portfolio Analysis
    if (!process.env.N8N_WORKFLOW_ANALYSIS_WEBHOOK_URL) {
      console.warn('⚠️ N8N_WORKFLOW_ANALYSIS_WEBHOOK_URL not configured');
      
      // Return mock success for development
      return NextResponse.json({
        success: true,
        message: `Analysis prepared for ${goals.length} goals. [DEV MODE: n8n webhook not configured yet]`,
        batch_id: batchId,
        batch_name: batchName,
        goals_analyzed: goals.length,
        dev_mode: true,
        payload_preview: analysisPayload,
      });
    }

    try {
      const response = await fetch(process.env.N8N_WORKFLOW_ANALYSIS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('n8n analysis webhook failed:', errorText);
        
        // Parse n8n error
        let errorDetail = 'Unknown error';
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = errorJson.message || errorJson.hint || errorText;
        } catch {
          errorDetail = errorText;
        }
        
        return NextResponse.json(
          { 
            error: 'Webhook n8n belum aktif',
            message: `Silakan setup workflow "Portfolio Analysis" di n8n terlebih dahulu. Error: ${errorDetail}`,
            help: 'Buka N8N_PORTFOLIO_ANALYSIS.md untuk instruksi setup',
          },
          { status: 500 }
        );
      }

      console.log(`✅ Portfolio analysis triggered for ${goals.length} goals`);

      return NextResponse.json({
        success: true,
        message: `Analysis triggered for ${goals.length} strategic goals. AI akan memberikan rekomendasi dalam beberapa saat.`,
        batch_id: batchId,
        batch_name: batchName,
        goals_analyzed: goals.length,
      });
    } catch (fetchError) {
      console.error('Error calling n8n webhook:', fetchError);
      
      return NextResponse.json(
        { 
          error: 'Tidak dapat terhubung ke n8n',
          message: 'Pastikan n8n server berjalan dan workflow sudah dibuat',
          help: 'Buka N8N_PORTFOLIO_ANALYSIS.md untuk instruksi setup',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error triggering goal analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze goals' },
      { status: 500 }
    );
  }
}
