import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Proxy API to trigger n8n Workflow #2 (KPI Breakdown)
 * This avoids CORS issues when calling n8n from frontend
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ batch_id: string }> }
) {
  try {
    const { batch_id } = await params;
      console.log('=== Triggering n8n KPI Breakdown ===');
    console.log('Batch ID:', batch_id);

    // Update batch status to "kpi_loading" before triggering workflow
    // This status will persist even if user leaves the page
    console.log('Setting batch status to "kpi_loading"...');
    await prisma.analysis_batches.update({
      where: { batch_id: batch_id },
      data: { status: 'kpi_loading' },
    });
    console.log('Batch status updated to "kpi_loading"');

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = process.env.N8N_WORKFLOW_2_WEBHOOK_URL || 
                          process.env.NEXT_PUBLIC_N8N_WORKFLOW_2_WEBHOOK_URL || 
                          'https://n8n.drwapp.com/webhook-test/hrisnextgen-kpi-breakdown';
      console.log('n8n Webhook URL:', n8nWebhookUrl);

    // Trigger n8n workflow
    let n8nResponse;
    try {
      n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batch_id: batch_id,
        }),
      });
    } catch (fetchError) {
      console.error('=== Network error calling n8n ===');
      console.error('Fetch error:', fetchError);
      
      return NextResponse.json(
        { 
          error: 'Network error connecting to n8n',
          message: fetchError instanceof Error ? fetchError.message : 'Failed to connect to n8n server',
          webhook_url: n8nWebhookUrl,
        },
        { status: 503 } // Service Unavailable
      );
    }

    console.log('n8n Response Status:', n8nResponse.status);
    console.log('n8n Response Headers:', Object.fromEntries(n8nResponse.headers.entries()));

    // Get response body as text first
    const responseText = await n8nResponse.text();
    console.log('n8n Response Body (raw):', responseText);    if (!n8nResponse.ok) {
      console.error('n8n Error Response:', responseText);
      
      // Check if response looks like HTML (common when webhook doesn't exist)
      const isHtml = responseText.trim().toLowerCase().startsWith('<!doctype') || 
                     responseText.trim().toLowerCase().startsWith('<html');
      
      let errorMessage = 'Failed to trigger n8n workflow';
      if (isHtml) {
        errorMessage = 'n8n webhook endpoint tidak ditemukan atau tidak aktif. Pastikan workflow sudah dibuat dan aktif di n8n.';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: isHtml ? 'Webhook returned HTML page instead of JSON' : responseText,
          status: n8nResponse.status,
          webhook_url: n8nWebhookUrl,
        },
        { status: 502 } // Bad Gateway
      );
    }    // Try to parse as JSON, fallback to text
    let n8nData;
    if (responseText) {
      // Check if response is HTML
      const isHtml = responseText.trim().toLowerCase().startsWith('<!doctype') || 
                     responseText.trim().toLowerCase().startsWith('<html');
      
      if (isHtml) {
        console.error('n8n returned HTML page - webhook likely doesn\'t exist or is inactive');
        return NextResponse.json(
          { 
            error: 'n8n webhook endpoint tidak ditemukan atau tidak aktif',
            details: 'Webhook returned HTML page instead of JSON response. Pastikan workflow sudah dibuat dan aktif di n8n.',
            webhook_url: n8nWebhookUrl,
          },
          { status: 502 }
        );
      }
      
      try {
        n8nData = JSON.parse(responseText);
        console.log('n8n Response Data (parsed JSON):', n8nData);
      } catch (e) {
        console.log('n8n Response is not JSON, using text:', responseText);
        n8nData = { message: responseText };
      }
    } else {
      console.log('n8n Response is empty (this is OK for webhooks)');
      n8nData = { message: 'Workflow triggered successfully (empty response)' };
    }

    console.log('=== n8n Workflow Triggered Successfully ===');

    return NextResponse.json({
      success: true,
      message: 'AI workflow triggered successfully',
      batch_id: batch_id,
      n8n_response: n8nData,
    });
  } catch (error) {
    console.error('=== Error triggering n8n ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
