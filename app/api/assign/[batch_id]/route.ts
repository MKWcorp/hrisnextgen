import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/assign/[batch_id]
 * Fetch all proposed KPIs for a specific batch
 * Includes related AI recommended role and proposed breakdown for context
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  try {    const { batch_id } = await params;

    console.log('Fetching KPIs for batch:', batch_id);

    // Fetch all proposed KPIs for this batch with related data
    const kpis = await prisma.proposed_kpis.findMany({
      where: {
        batch_id,
      },
      include: {
        ai_recommended_roles: true,   // Include role info to show recommended role name
        proposed_breakdowns: true,    // Include breakdown to show parent target
      },
    });    console.log(`Found ${kpis.length} KPIs for batch ${batch_id}`);

    // Convert BigInt to String to avoid serialization error
    const serializedKpis = kpis.map(kpi => ({
      ...kpi,
      kpi_target_value: kpi.kpi_target_value?.toString(),
      ai_recommended_roles: kpi.ai_recommended_roles ? {
        ...kpi.ai_recommended_roles,
      } : null,
      proposed_breakdowns: kpi.proposed_breakdowns ? {
        ...kpi.proposed_breakdowns,
        value: kpi.proposed_breakdowns.value?.toString(),
      } : null,
    }));

    // Return KPIs (empty array if none found)
    return NextResponse.json({
      kpis: serializedKpis,
      count: kpis.length,
      batch_id: batch_id,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching KPIs for assignment:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'Failed to fetch KPIs for assignment',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assign/[batch_id]
 * Assign KPIs to users, update batch status, and trigger Workflow #3 for daily task generation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  try {
    const { batch_id } = await params;
    
    // Get assignments data from request body
    const body = await request.json();
    const assignments: Array<{ kpi_id: string; assigned_user_id: string }> = body.assignments || [];

    console.log('=== Assigning KPIs to Users ===');
    console.log('Batch ID:', batch_id);
    console.log('Number of assignments:', assignments.length);

    if (assignments.length === 0) {
      return NextResponse.json(
        { error: 'No assignments provided', message: 'assignments array is empty' },
        { status: 400 }
      );
    }    // Perform all KPI assignments in a transaction for efficiency and atomicity
    await prisma.$transaction(async (tx) => {
      for (const assignment of assignments) {
        await tx.proposed_kpis.update({
          where: { kpi_id: assignment.kpi_id },
          data: {
            assigned_user_id: assignment.assigned_user_id,
            status: 'assigned',
          },
        });
        console.log(`✅ Assigned KPI ${assignment.kpi_id} to user ${assignment.assigned_user_id}`);
      }
    });

    console.log('✅ All KPIs assigned successfully');

    // Update batch status to indicate we're moving to daily task generation
    console.log('Updating batch status to Generating_Daily_Tasks...');
    await prisma.analysis_batches.update({
      where: { batch_id },
      data: { status: 'Generating_Daily_Tasks' },
    });
    console.log('✅ Batch status updated');

    // Trigger n8n Workflow #3 for daily task generation
    const n8nWebhookUrl = process.env.N8N_WORKFLOW_3_WEBHOOK_URL || 
                          process.env.NEXT_PUBLIC_N8N_WORKFLOW_3_WEBHOOK_URL;
    
    if (n8nWebhookUrl) {
      console.log('Triggering n8n Workflow #3 for daily task generation...');
      console.log('Webhook URL:', n8nWebhookUrl);
      
      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            batch_id: batch_id,
          }),
        });

        console.log('n8n Response Status:', n8nResponse.status);
        
        if (!n8nResponse.ok) {
          console.warn('⚠️ n8n workflow trigger failed:', n8nResponse.status);
        } else {
          console.log('✅ n8n Workflow #3 triggered successfully');
        }
      } catch (n8nError) {
        console.error('⚠️ Error triggering n8n workflow:', n8nError);
        // Don't fail the entire request if n8n trigger fails
        // The assignments are already saved
      }
    } else {
      console.warn('⚠️ N8N_WORKFLOW_3_WEBHOOK_URL not configured, skipping workflow trigger');
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'KPIs assigned successfully and daily task generation initiated',
      batch_id: batch_id,
      assigned_count: assignments.length,
    }, { status: 200 });

  } catch (error) {
    console.error('=== Error assigning KPIs ===');
    console.error('Error details:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'Failed to assign KPIs',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
