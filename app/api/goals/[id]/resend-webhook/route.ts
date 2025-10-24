import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goalId = params.id;

    // Fetch goal with related data
    const goal = await prisma.strategic_goals.findUnique({
      where: { goal_id: goalId },
      include: {
        business_units: true,
        created_by_user: true,
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    // Prepare webhook payload
    const webhookPayload = {
      goal_id: goal.goal_id,
      goal_name: goal.goal_name,
      target_value: goal.target_value.toString(),
      target_unit: goal.target_unit || 'units',
      business_unit: goal.business_units?.name || 'Unknown',
      business_unit_id: goal.business_unit_id,
      created_by_user_id: goal.created_by_user_id,
      start_date: goal.start_date.toISOString(),
      end_date: goal.end_date.toISOString(),
      created_at: goal.created_at?.toISOString() || new Date().toISOString(),
    };

    // Send to n8n webhook
    if (!process.env.N8N_WORKFLOW_1_WEBHOOK_URL) {
      return NextResponse.json(
        { error: 'N8N webhook URL not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(process.env.N8N_WORKFLOW_1_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      console.error('n8n webhook failed:', await response.text());
      return NextResponse.json(
        { error: 'Failed to send webhook to n8n' },
        { status: 500 }
      );
    }

    console.log(`✅ Webhook resent successfully for goal: ${goal.goal_id}`);

    return NextResponse.json({
      success: true,
      message: 'Webhook sent successfully to n8n',
      payload: webhookPayload,
    });
  } catch (error) {
    console.error('Error resending webhook:', error);
    return NextResponse.json(
      { error: 'Failed to resend webhook' },
      { status: 500 }
    );
  }
}
