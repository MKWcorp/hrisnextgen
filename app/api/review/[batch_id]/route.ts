import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';

interface ProposedBreakdown {
  breakdown_id: string;
  batch_id: string;
  name: string;
  value: bigint;
  unit?: string | null;
  description?: string | null;
  status?: string | null;
  created_at: Date;
}

interface BatchManagedAsset {
  asset_id: string;
  batch_id: string;
  asset_category: string;
  asset_name: string;
  asset_identifier?: string | null;
  metric_name?: string | null;
  metric_value?: bigint | null;
  created_at: Date;
}

interface AIRecommendedRole {
  role_recommendation_id: string;
  batch_id: string;
  role_name: string;
  responsibilities: string;
  created_at: Date;
}

interface AnalysisBatch {
  batch_id: string;
  batch_name: string;
  status: string;
  created_by_user_id: string;
  business_unit_id: string;
  created_at: Date;
  ai_recommended_roles: AIRecommendedRole[];
  proposed_breakdowns: ProposedBreakdown[];
  batch_managed_assets: BatchManagedAsset[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { batch_id } = await params;    // Fetch batch with all relations
    const batch = await prisma.analysis_batches.findUnique({
      where: {
        batch_id: batch_id,
      },
      include: {
        ai_recommended_roles: true,
        proposed_breakdowns: true,
        batch_managed_assets: true,
      },
    });

    // If batch not found, return 404
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found', message: `Analysis batch with ID ${batch_id} does not exist` },
        { status: 404 }
      );
    }    // Convert BigInt to string for JSON serialization
    const serializedBatch = {
      ...batch,
      proposed_breakdowns: batch.proposed_breakdowns.map((breakdown: typeof batch.proposed_breakdowns[0]) => ({
        ...breakdown,
        value: breakdown.value.toString(), // Convert BigInt to string
      })),
      batch_managed_assets: batch.batch_managed_assets.map((asset: typeof batch.batch_managed_assets[0]) => ({
        ...asset,
        metric_value: asset.metric_value ? asset.metric_value.toString() : null, // Convert BigInt to string
      })),
    };

    // Return complete batch data with all relations
    return NextResponse.json(serializedBatch, { status: 200 });
  } catch (error) {
    console.error('Error fetching batch:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch analysis batch data' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { batch_id } = await params;
    
    // Get edited data from request body
    const { teamRoles, breakdowns, assets } = await request.json();

    if (!teamRoles || !Array.isArray(teamRoles)) {
      return NextResponse.json(
        { error: 'Invalid data', message: 'Team roles array is required' },
        { status: 400 }
      );
    }

    if (!breakdowns || !Array.isArray(breakdowns)) {
      return NextResponse.json(
        { error: 'Invalid data', message: 'Breakdowns array is required' },
        { status: 400 }
      );
    }

    if (!assets || !Array.isArray(assets)) {
      return NextResponse.json(
        { error: 'Invalid data', message: 'Assets array is required' },
        { status: 400 }
      );
    }    // Use transaction for safe operations
    await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // Step 1: Delete all old team roles for this batch
      await tx.ai_recommended_roles.deleteMany({
        where: {
          batch_id: batch_id,
        },
      });

      // Step 2: Create new team roles
      await tx.ai_recommended_roles.createMany({
        data: teamRoles.map((role: any) => ({
          role_name: role.role_name,
          responsibilities: role.responsibilities,
          batch_id: batch_id,
        })),
      });

      // Step 3: Delete all old proposed_breakdowns for this batch
      await tx.proposed_breakdowns.deleteMany({
        where: {
          batch_id: batch_id,
        },
      });

      // Step 4: Create new breakdowns
      await tx.proposed_breakdowns.createMany({
        data: breakdowns.map((b: any) => ({
          name: b.name,
          value: BigInt(b.value), // Convert to BigInt for database
          unit: b.unit,
          description: b.description || null, // Include description from frontend
          batch_id: batch_id,
        })),
      });

      // Step 5: Delete all old assets for this batch
      await tx.batch_managed_assets.deleteMany({
        where: {
          batch_id: batch_id,
        },
      });

      // Step 6: Create new assets
      await tx.batch_managed_assets.createMany({
        data: assets.map((asset: any) => ({
          asset_category: asset.asset_category,
          asset_name: asset.asset_name,
          asset_identifier: asset.asset_identifier || null,
          metric_name: asset.metric_name || null,
          metric_value: asset.metric_value ? BigInt(asset.metric_value) : null,
          batch_id: batch_id,
        })),
      });

      // Step 7: Update analysis_batches status to trigger n8n Workflow #2
      await tx.analysis_batches.update({
        where: {
          batch_id: batch_id,
        },
        data: {
          status: 'kpi_breakdown_pending',
        },
      });
    });

    // Step 6: Trigger n8n Workflow #2 webhook
    const n8nWebhookUrl = process.env.N8N_WORKFLOW_2_WEBHOOK_URL || 'https://n8n.drwapp.com/webhook/hrisnextgen-kpi-breakdown';
    
    try {
      await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch_id: batch_id,
        }),
      });
    } catch (webhookError) {
      console.error('Failed to trigger n8n webhook:', webhookError);
      // Continue anyway - webhook failure shouldn't stop the process
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Team roles, breakdowns, and assets saved successfully, KPI breakdown workflow triggered',
        batch_id: batch_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to save data' },
      { status: 500 }
    );
  }
}
