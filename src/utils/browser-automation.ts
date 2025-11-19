/**
 * Browser Automation Service
 * Integrates Chrome DevTools MCP with AI agent for intelligent browser control
 */

import { chromeDevToolsMCP, MCP_BROWSER_TOOLS, type BrowserTask } from './mcp-integration';

export interface AutomationTask {
  id: string;
  type: 'navigation' | 'interaction' | 'extraction' | 'debugging';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  steps: BrowserStep[];
  context?: {
    previousUrl?: string;
    sessionId?: string;
    userIntent?: string;
  };
  expectedOutcome?: string;
}

export interface BrowserStep {
  action: 'navigate' | 'click' | 'type' | 'screenshot' | 'wait' | 'evaluate' | 'scroll';
  target?: string;
  value?: string | number;
  description: string;
  timeout?: number;
  retry?: number;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  timestamp: string;
  stepsExecuted: number;
  stepsSuccessful: number;
  output?: any;
  error?: string;
  screenshot?: string;
  pageUrl?: string;
  metadata?: Record<string, any>;
}

export class BrowserAutomationService {
  private isInitialized = false;
  private activeTasks = new Map<string, AutomationTask>();
  private taskResults = new Map<string, TaskResult>();
  private currentSession: string | null = null;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Initialize the browser automation service
   */
  async initialize(options?: {
    headless?: boolean;
    viewport?: string;
    channel?: 'stable' | 'canary' | 'beta' | 'dev';
  }): Promise<void> {
    if (this.isInitialized) {
      console.log('Browser automation service is already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Browser Automation Service...');
      
      await chromeDevToolsMCP.startServer({
        headless: options?.headless ?? true,
        viewport: options?.viewport ?? '1920x1080',
        channel: options?.channel ?? 'stable'
      });

      this.currentSession = `session_${Date.now()}`;
      this.isInitialized = true;
      
      console.log('✅ Browser Automation Service initialized successfully');
      console.log(`🆔 Session ID: ${this.currentSession}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize browser automation service:', error);
      throw error;
    }
  }

  /**
   * Execute an automation task with AI guidance
   */
  async executeTask(task: AutomationTask): Promise<TaskResult> {
    if (!this.isInitialized) {
      throw new Error('Browser automation service not initialized');
    }

    this.activeTasks.set(task.id, task);
    
    console.log(`🎯 Executing task: ${task.description}`);
    console.log(`📋 Task type: ${task.type} | Priority: ${task.priority}`);

    const result: TaskResult = {
      taskId: task.id,
      success: false,
      timestamp: new Date().toISOString(),
      stepsExecuted: 0,
      stepsSuccessful: 0,
      output: {},
      metadata: {
        taskType: task.type,
        priority: task.priority,
        sessionId: this.currentSession
      }
    };

    try {
      // Execute each step in the task
      for (const step of task.steps) {
        console.log(`⚡ Step ${result.stepsExecuted + 1}: ${step.description}`);
        
        const stepResult = await this.executeStep(step, task.context);
        result.stepsExecuted++;
        
        if (stepResult.success) {
          result.stepsSuccessful++;
          result.output = { ...result.output, ...stepResult.data };
        } else {
          console.warn(`⚠️ Step failed: ${step.description}`);
          if (step.retry && step.retry > 0) {
            console.log(`🔄 Retrying step (${step.retry} attempts left)`);
            // Implement retry logic here
          } else {
            console.error(`❌ Step failed permanently: ${step.description}`);
            break;
          }
        }
        
        // Small delay between steps to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      result.success = result.stepsSuccessful === result.stepsExecuted;
      
      if (result.success) {
        console.log(`✅ Task completed successfully: ${result.stepsSuccessful}/${result.stepsExecuted} steps`);
      } else {
        console.error(`❌ Task failed: ${result.stepsSuccessful}/${result.stepsExecuted} steps`);
      }
      
    } catch (error) {
      console.error('❌ Task execution error:', error);
      result.error = error instanceof Error ? error.message : String(error);
      result.success = false;
    } finally {
      this.taskResults.set(task.id, result);
      this.activeTasks.delete(task.id);
    }

    return result;
  }

  /**
   * Execute a single browser step
   */
  private async executeStep(step: BrowserStep, context?: any): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const browserTask: BrowserTask = {
        action: step.action as any,
        target: step.target,
        value: step.value,
        timeout: step.timeout,
        url: step.target
      };

      const result = await chromeDevToolsMCP.executeBrowserTask(browserTask);
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Create a navigation task for AI agents
   */
  createNavigationTask(url: string, description: string, userIntent?: string): AutomationTask {
    return {
      id: `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'navigation',
      priority: 'medium',
      description,
      steps: [
        {
          action: 'navigate',
          target: url,
          description: `Navigate to ${url}`,
          timeout: 10000
        }
      ],
      context: { userIntent }
    };
  }

  /**
   * Create an interaction task for AI agents
   */
  createInteractionTask(
    action: 'click' | 'type',
    target: string,
    value: string | undefined,
    description: string
  ): AutomationTask {
    return {
      id: `interact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'interaction',
      priority: 'medium',
      description,
      steps: [
        {
          action,
          target,
          value,
          description: `${action} on ${target}${value ? ` with value "${value}"` : ''}`,
          timeout: 5000
        }
      ]
    };
  }

  /**
   * Create a data extraction task
   */
  createExtractionTask(
    selectors: string[],
    extractionType: 'text' | 'attributes' | 'screenshot',
    description: string
  ): AutomationTask {
    return {
      id: `extract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'extraction',
      priority: 'medium',
      description,
      steps: selectors.map(selector => ({
        action: 'evaluate',
        target: selector,
        description: `Extract ${extractionType} from ${selector}`,
        timeout: 5000
      }))
    };
  }

  /**
   * Get available browser tools
   */
  async getAvailableTools(): Promise<string[]> {
    return await chromeDevToolsMCP.getBrowserTools();
  }

  /**
   * Get current session information
   */
  getSessionInfo(): {
    sessionId: string | null;
    initialized: boolean;
    activeTasks: number;
    completedTasks: number;
  } {
    return {
      sessionId: this.currentSession,
      initialized: this.isInitialized,
      activeTasks: this.activeTasks.size,
      completedTasks: this.taskResults.size
    };
  }

  /**
   * Get task result by ID
   */
  getTaskResult(taskId: string): TaskResult | undefined {
    return this.taskResults.get(taskId);
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up browser automation service...');
    
    // Stop all active tasks
    this.activeTasks.clear();
    
    // Save results (in a real implementation, you might save to database)
    console.log(`📊 Completed ${this.taskResults.size} tasks`);
    
    // Stop the MCP server
    await chromeDevToolsMCP.stopServer();
    
    this.isInitialized = false;
    this.currentSession = null;
    
    console.log('✅ Browser automation service cleaned up');
  }

  /**
   * Setup event listeners for the MCP server
   */
  private setupEventListeners(): void {
    chromeDevToolsMCP.on('message', (data) => {
      console.log('[Browser Automation] MCP Server message:', data);
    });

    chromeDevToolsMCP.on('error', (error) => {
      console.error('[Browser Automation] MCP Server error:', error);
    });

    chromeDevToolsMCP.on('close', (code) => {
      console.log('[Browser Automation] MCP Server closed:', code);
      this.isInitialized = false;
    });
  }
}

// Export singleton instance
export const browserAutomation = new BrowserAutomationService();
