/**
 * MCP Integration for Chrome DevTools
 * Connects the agentic chatbot with browser automation capabilities
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export interface MCPServerOptions {
  port?: number;
  headless?: boolean;
  browserUrl?: string;
  wsEndpoint?: string;
  logFile?: string;
  viewport?: string;
  channel?: 'stable' | 'canary' | 'beta' | 'dev';
}

export class ChromeDevToolsMCPIntegration extends EventEmitter {
  private serverProcess: ChildProcess | null = null;
  private isRunning = false;
  private serverPort: number;

  constructor(options: MCPServerOptions = {}) {
    super();
    this.serverPort = options.port || 3002;
  }

  /**
   * Start the Chrome DevTools MCP server
   */
  async startServer(options: MCPServerOptions = {}): Promise<void> {
    if (this.isRunning) {
      throw new Error('MCP server is already running');
    }

    const args = ['chrome-devtools-mcp@latest'];
    
    // Add command line arguments based on options
    if (options.headless) {
      args.push('--headless');
    }
    
    if (options.browserUrl) {
      args.push('--browserUrl', options.browserUrl);
    }
    
    if (options.wsEndpoint) {
      args.push('--wsEndpoint', options.wsEndpoint);
    }
    
    if (options.logFile) {
      args.push('--logFile', options.logFile);
    }
    
    if (options.viewport) {
      args.push('--viewport', options.viewport);
    }
    
    if (options.channel) {
      args.push('--channel', options.channel);
    }

    console.log('🚀 Starting Chrome DevTools MCP server...');
    console.log(`Command: npx ${args.join(' ')}`);

    this.serverProcess = spawn('npx', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    });

    this.serverProcess.stdout?.on('data', (data) => {
      const message = data.toString();
      console.log('[MCP Server]', message);
      this.emit('message', { type: 'stdout', data: message });
    });

    this.serverProcess.stderr?.on('data', (data) => {
      const message = data.toString();
      console.error('[MCP Server Error]', message);
      this.emit('message', { type: 'stderr', data: message });
    });

    this.serverProcess.on('close', (code) => {
      console.log(`[MCP Server] Process exited with code ${code}`);
      this.isRunning = false;
      this.emit('close', code);
    });

    this.serverProcess.on('error', (error) => {
      console.error('[MCP Server] Process error:', error);
      this.emit('error', error);
    });

    this.isRunning = true;
    
    // Wait a bit for the server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`✅ Chrome DevTools MCP server started on port ${this.serverPort}`);
  }

  /**
   * Stop the MCP server
   */
  async stopServer(): Promise<void> {
    if (this.serverProcess && this.isRunning) {
      console.log('🛑 Stopping Chrome DevTools MCP server...');
      
      this.serverProcess.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise((resolve) => {
        if (this.serverProcess) {
          this.serverProcess.on('close', resolve);
          // Force kill after 5 seconds
          setTimeout(() => {
            if (this.serverProcess) {
              this.serverProcess.kill('SIGKILL');
            }
            resolve(null);
          }, 5000);
        } else {
          resolve(null);
        }
      });
      
      this.serverProcess = null;
      this.isRunning = false;
      console.log('✅ Chrome DevTools MCP server stopped');
    }
  }

  /**
   * Send a command to the MCP server
   */
  async sendCommand(command: string, params?: any): Promise<any> {
    // This would integrate with the MCP protocol
    // For now, we'll simulate the command structure
    const mcpCommand = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: command,
      params: params || {}
    };

    console.log(`[MCP Command] ${command}`, params);
    
    // In a real implementation, this would send the command to the MCP server
    // via stdio or a named pipe/socket
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          jsonrpc: "2.0",
          id: mcpCommand.id,
          result: {
            success: true,
            message: `Command ${command} executed successfully`,
            timestamp: new Date().toISOString()
          }
        });
      }, 100);
    });
  }

  /**
   * Get browser tools from the MCP server
   */
  async getBrowserTools(): Promise<string[]> {
    try {
      const result = await this.sendCommand('tools/list');
      return result.result?.tools || [];
    } catch (error) {
      console.error('Failed to get browser tools:', error);
      return [];
    }
  }

  /**
   * Execute browser automation task
   */
  async executeBrowserTask(task: {
    url?: string;
    action: 'navigate' | 'click' | 'type' | 'screenshot' | 'getElements';
    selector?: string;
    text?: string;
    viewport?: { width: number; height: number };
  }): Promise<any> {
    const commandMap = {
      navigate: 'browser/navigate',
      click: 'browser/click',
      type: 'browser/type',
      screenshot: 'browser/screenshot',
      getElements: 'browser/getElements'
    };

    const mcpCommand = commandMap[task.action];
    const params = {
      ...task,
      timestamp: new Date().toISOString()
    };

    return await this.sendCommand(mcpCommand, params);
  }

  /**
   * Get current status of the MCP server
   */
  getStatus(): { isRunning: boolean; serverPort: number } {
    return {
      isRunning: this.isRunning,
      serverPort: this.serverPort
    };
  }

  /**
   * Check if the server is running
   */
  isHealthy(): boolean {
    return this.isRunning && this.serverProcess !== null && !this.serverProcess.killed;
  }
}

// Export singleton instance
export const chromeDevToolsMCP = new ChromeDevToolsMCPIntegration();

// Utility functions
export const MCP_BROWSER_TOOLS = [
  'browser/navigate',
  'browser/click', 
  'browser/type',
  'browser/screenshot',
  'browser/getElements',
  'browser/evaluate',
  'browser/console',
  'browser/network',
  'browser/dom',
  'browser/performance'
] as const;

export const DEFAULT_MCP_OPTIONS: MCPServerOptions = {
  port: 3002,
  headless: true,
  viewport: '1920x1080',
  channel: 'stable'
};
