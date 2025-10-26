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
    console.log('=== POST /api/review/[batch_id] START ===');
    
    // Await params in Next.js 15+
    const { batch_id } = await params;
    console.log('Batch ID:', batch_id);
    
    // Get edited data from request body
    const { teamRoles, breakdowns, assets } = await request.json();
    console.log('Received data:', {
      teamRoles: teamRoles.length,
      breakdowns: breakdowns.length,
      assets: assets.length,
    });

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
    }    console.log('Starting database transaction...');
    
    // Use transaction for safe operations - OPTIMIZED with upsert instead of delete+create
    await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      console.log('Fetching existing records...');
      
      // Get existing IDs to determine what to update vs create
      const existingRoles = await tx.ai_recommended_roles.findMany({
        where: { batch_id: batch_id },
        select: { role_recommendation_id: true },
      });
      const existingBreakdowns = await tx.proposed_breakdowns.findMany({
        where: { batch_id: batch_id },
        select: { breakdown_id: true },
      });
      const existingAssets = await tx.batch_managed_assets.findMany({
        where: { batch_id: batch_id },
        select: { asset_id: true },
      });      // TEAM ROLES: Update existing, create new, delete removed
      console.log('Processing team roles...');
      const roleIdsFromFrontend = teamRoles.filter((r: any) => r.role_recommendation_id).map((r: any) => r.role_recommendation_id);
      const rolesToDelete = existingRoles.filter(r => !roleIdsFromFrontend.includes(r.role_recommendation_id));
      
      console.log(`Roles: ${teamRoles.length} from frontend, ${existingRoles.length} existing, ${rolesToDelete.length} to delete`);
      
      if (rolesToDelete.length > 0) {
        await tx.ai_recommended_roles.deleteMany({
          where: { role_recommendation_id: { in: rolesToDelete.map(r => r.role_recommendation_id) } },
        });
      }

      for (const role of teamRoles) {
        if (role.role_recommendation_id) {
          // Update existing
          await tx.ai_recommended_roles.update({
            where: { role_recommendation_id: role.role_recommendation_id },
            data: {
              role_name: role.role_name,
              responsibilities: role.responsibilities,
            },
          });
        } else {
          // Create new
          await tx.ai_recommended_roles.create({
            data: {
              role_name: role.role_name,
              responsibilities: role.responsibilities,
              batch_id: batch_id,
            },
          });
        }
      }      // BREAKDOWNS: Update existing, create new, delete removed
      console.log('Processing breakdowns...');
      const breakdownIdsFromFrontend = breakdowns.filter((b: any) => b.breakdown_id).map((b: any) => b.breakdown_id);
      const breakdownsToDelete = existingBreakdowns.filter(b => !breakdownIdsFromFrontend.includes(b.breakdown_id));
      
      console.log(`Breakdowns: ${breakdowns.length} from frontend, ${existingBreakdowns.length} existing, ${breakdownsToDelete.length} to delete`);
      
      if (breakdownsToDelete.length > 0) {
        await tx.proposed_breakdowns.deleteMany({
          where: { breakdown_id: { in: breakdownsToDelete.map(b => b.breakdown_id) } },
        });
      }

      for (const breakdown of breakdowns) {
        if (breakdown.breakdown_id) {
          // Update existing
          await tx.proposed_breakdowns.update({
            where: { breakdown_id: breakdown.breakdown_id },
            data: {
              name: breakdown.name,
              value: BigInt(breakdown.value),
              unit: breakdown.unit,
              description: breakdown.description || null,
            },
          });
        } else {
          // Create new
          await tx.proposed_breakdowns.create({
            data: {
              name: breakdown.name,
              value: BigInt(breakdown.value),
              unit: breakdown.unit,
              description: breakdown.description || null,
              batch_id: batch_id,
            },
          });
        }
      }      // ASSETS: Update existing, create new, delete removed
      console.log('Processing assets...');
      const assetIdsFromFrontend = assets.filter((a: any) => a.asset_id).map((a: any) => a.asset_id);
      const assetsToDelete = existingAssets.filter(a => !assetIdsFromFrontend.includes(a.asset_id));
      
      console.log(`Assets: ${assets.length} from frontend, ${existingAssets.length} existing, ${assetsToDelete.length} to delete`);
      
      if (assetsToDelete.length > 0) {
        await tx.batch_managed_assets.deleteMany({
          where: { asset_id: { in: assetsToDelete.map(a => a.asset_id) } },
        });
      }

      for (const asset of assets) {
        if (asset.asset_id) {
          // Update existing
          await tx.batch_managed_assets.update({
            where: { asset_id: asset.asset_id },
            data: {
              asset_category: asset.asset_category,
              asset_name: asset.asset_name,
              asset_identifier: asset.asset_identifier || null,
              metric_name: asset.metric_name || null,
              metric_value: asset.metric_value ? BigInt(asset.metric_value) : null,
            },
          });
        } else {
          // Create new
          await tx.batch_managed_assets.create({
            data: {
              asset_category: asset.asset_category,
              asset_name: asset.asset_name,
              asset_identifier: asset.asset_identifier || null,
              metric_name: asset.metric_name || null,
              metric_value: asset.metric_value ? BigInt(asset.metric_value) : null,
              batch_id: batch_id,
            },
          });
        }      }

      // Don't update status here! Let n8n workflow update it when AI completes.
      // Status remains 'review_pending' or 'Analyzing' depending on current state.
      console.log('Keeping batch status as is. Only n8n can change to KPI_Assignment_Pending.');
      
      console.log('Transaction completed successfully!');
    });

    // NOTE: We don't trigger n8n webhook here anymore.
    // User can manually trigger AI recommendation if they want to regenerate KPI breakdowns.
    // This allows quick saves without waiting for AI processing.
    // Status will only change to 'KPI_Assignment_Pending' when n8n workflow completes.

    console.log('=== POST /api/review/[batch_id] SUCCESS ===');
    return NextResponse.json(
      {
        success: true,
        message: 'Team roles, breakdowns, and assets saved successfully',
        batch_id: batch_id,
        // Don't return new status - it hasn't changed
      },
      { status: 200 }
    );} catch (error) {
    console.error('=== POST /api/review/[batch_id] ERROR ===');
    console.error('Error saving data:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to save data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
