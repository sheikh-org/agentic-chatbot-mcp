import { NextRequest, NextResponse } from 'next/server';
import { agentBrowser } from '../../../../src/utils/agent-browser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userQuery, currentUrl, pageContext } = body;

    if (!userQuery) {
      return NextResponse.json(
        { error: 'userQuery is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Processing browser automation request:', userQuery);

    const result = await agentBrowser.processQuery({
      userQuery,
      currentUrl,
      pageContext
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = agentBrowser.getStatus();
    
    return NextResponse.json({
      status: 'ready',
      agent: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Status Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}