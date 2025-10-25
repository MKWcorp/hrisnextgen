import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Webhook endpoint untuk menerima hasil analysis dari n8n
 * Called by: n8n HTTP Request node (after AI Agent + Code Node)
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log('📊 Analysis result received from n8n:');
    console.log('Analysis ID:', payload.analysis_id);
    console.log('Score:', payload.skor_portfolio);
    console.log('Status:', payload.status);
    console.log('Goals Analyzed:', payload.goals_analyzed);

    // Save to database
    await prisma.$executeRaw`
      INSERT INTO analysis_results (
        analysis_id,
        analyzed_at,
        goals_analyzed,
        skor_portfolio,
        status,
        quick_summary,
        full_analysis,
        status_workflow,
        created_at
      ) VALUES (
        ${payload.analysis_id},
        ${new Date(payload.analyzed_at)},
        ${payload.goals_analyzed},
        ${payload.skor_portfolio},
        ${payload.status},
        ${payload.ringkasan},
        ${JSON.stringify(payload)}::jsonb,
        'quick_done',
        NOW()
      )
      ON CONFLICT (analysis_id) DO UPDATE SET
        skor_portfolio = EXCLUDED.skor_portfolio,
        status = EXCLUDED.status,
        quick_summary = EXCLUDED.quick_summary,
        full_analysis = EXCLUDED.full_analysis
    `;

    console.log('✅ Analysis saved to database');

    return NextResponse.json({
      success: true,
      message: 'Analysis result saved successfully',
      analysis_id: payload.analysis_id,
      saved_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error saving analysis result:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save analysis result',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
