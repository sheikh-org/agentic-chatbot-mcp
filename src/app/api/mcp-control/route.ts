import { NextRequest, NextResponse } from 'next/server';
import { browserAutomation } from '../../../../src/utils/browser-automation';
import { chromeDevToolsMCP } from '../../../../src/utils/mcp-integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, options } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'initialize':
        await browserAutomation.initialize(options);
        return NextResponse.json({
          success: true,
          message: 'Browser automation initialized successfully',
          session: browserAutomation.getSessionInfo()
        });

      case 'cleanup':
        await browserAutomation.cleanup();
        return NextResponse.json({
          success: true,
          message: 'Browser automation cleaned up successfully'
        });

      case 'start-mcp':
        await chromeDevToolsMCP.startServer(options);
        return NextResponse.json({
          success: true,
          message: 'MCP server started successfully',
          status: chromeDevToolsMCP.getStatus()
        });

      case 'stop-mcp':
        await chromeDevToolsMCP.stopServer();
        return NextResponse.json({
          success: true,
          message: 'MCP server stopped successfully'
        });

      case 'get-tools':
        const tools = await browserAutomation.getAvailableTools();
        return NextResponse.json({
          success: true,
          tools
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('MCP Control API Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to execute action',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const mcpStatus = chromeDevToolsMCP.getStatus();
    const sessionInfo = browserAutomation.getSessionInfo();
    const tools = await browserAutomation.getAvailableTools();

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      mcp: {
        isRunning: mcpStatus.isRunning,
        port: mcpStatus.serverPort,
        healthy: chromeDevToolsMCP.isHealthy()
      },
      automation: sessionInfo,
      availableTools: tools
    });

  } catch (error) {
    console.error('MCP Status API Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}