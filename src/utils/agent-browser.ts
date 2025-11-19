/**
 * AI Agent Browser Integration
 * Connects the Google Generative AI agent with browser automation capabilities
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { browserAutomation, type AutomationTask, type TaskResult } from './browser-automation';

export interface AgentBrowserConfig {
  googleApiKey: string;
  modelName?: string;
  maxRetries?: number;
  enableDebugging?: boolean;
}

export interface BrowserAgentRequest {
  userQuery: string;
  currentUrl?: string;
  pageContext?: string;
  availableActions?: string[];
}

export interface BrowserAgentResponse {
  success: boolean;
  task?: AutomationTask;
  result?: TaskResult;
  reasoning: string;
  nextSteps?: string[];
  error?: string;
}

export class AgentBrowserIntegration {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: Required<AgentBrowserConfig>;
  private isEnabled = false;

  constructor(config: AgentBrowserConfig) {
    this.config = {
      maxRetries: 3,
      modelName: 'gemini-pro',
      enableDebugging: false,
      ...config
    };

    this.genAI = new GoogleGenerativeAI(config.googleApiKey);
    this.model = this.genAI.getGenerativeModel({ model: this.config.modelName });
  }

  /**
   * Enable the browser agent integration
   */
  async enable(): Promise<void> {
    if (this.isEnabled) return;

    console.log('🚀 Initializing AI Browser Agent...');
    
    // Initialize browser automation service
    await browserAutomation.initialize({
      headless: true,
      viewport: '1920x1080',
      channel: 'stable'
    });

    // Test AI model connection
    try {
      const testPrompt = "Please respond with 'AI Browser Agent initialized successfully'";
      const result = await this.model.generateContent(testPrompt);
      console.log('✅ AI model connection verified');
    } catch (error) {
      console.error('❌ AI model connection failed:', error);
      throw error;
    }

    this.isEnabled = true;
    console.log('✅ AI Browser Agent enabled and ready');
  }

  /**
   * Process a user query and execute browser automation if needed
   */
  async processQuery(request: BrowserAgentRequest): Promise<BrowserAgentResponse> {
    if (!this.isEnabled) {
      await this.enable();
    }

    const startTime = Date.now();
    
    try {
      console.log(`🤖 Processing user query: "${request.userQuery}"`);
      
      // Analyze the request with AI
      const analysis = await this.analyzeUserIntent(request);
      
      if (!analysis.requiresBrowserAutomation) {
        console.log('💭 Query does not require browser automation');
        return {
          success: true,
          reasoning: analysis.reasoning,
          nextSteps: analysis.suggestedActions
        };
      }

      // Create automation task
      const task = await this.createAutomationTask(request, analysis);
      
      if (!task) {
        return {
          success: false,
          error: 'Failed to create automation task',
          reasoning: 'AI analysis indicated browser automation was needed but task creation failed'
        };
      }

      // Execute the automation task
      console.log(`⚡ Executing automation task: ${task.description}`);
      const result = await browserAutomation.executeTask(task);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      console.log(`✅ Task completed in ${executionTime}ms`);

      return {
        success: result.success,
        task,
        result,
        reasoning: `Task executed successfully in ${executionTime}ms. ${result.success ? 'All steps completed.' : 'Some steps failed.'}`,
        nextSteps: this.generateNextSteps(result, analysis)
      };

    } catch (error) {
      console.error('❌ Error processing query:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        reasoning: 'An error occurred during query processing'
      };
    }
  }

  /**
   * Analyze user intent using AI
   */
  private async analyzeUserIntent(request: BrowserAgentRequest): Promise<{
    requiresBrowserAutomation: boolean;
    intent: string;
    confidence: number;
    reasoning: string;
    suggestedActions: string[];
    navigation?: {
      targetUrl: string;
      purpose: string;
    };
    interaction?: {
      action: 'click' | 'type' | 'scroll';
      target: string;
      value?: string;
    };
    extraction?: {
      type: 'text' | 'data' | 'screenshot';
      target: string;
    };
  }> {
    const prompt = `
Analyze the following user query and determine if it requires browser automation:

User Query: "${request.userQuery}"
Current URL: ${request.currentUrl || 'Not provided'}
Page Context: ${request.pageContext || 'Not provided'}

Available Browser Actions:
- Navigate to URLs
- Click elements
- Type text into fields
- Take screenshots
- Extract data from page elements
- Scroll pages
- Evaluate JavaScript

Please respond with a JSON object containing:
{
  "requiresBrowserAutomation": boolean,
  "intent": "brief description of what the user wants",
  "confidence": number between 0-1,
  "reasoning": "explanation of why automation is/isn't needed",
  "suggestedActions": ["array", "of", "suggested", "actions"],
  "navigation": {"targetUrl": "url", "purpose": "reason"},
  "interaction": {"action": "click|type|scroll", "target": "element", "value": "optional"},
  "extraction": {"type": "text|data|screenshot", "target": "element"}
}

Only include navigation, interaction, or extraction fields if they are relevant.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      if (this.config.enableDebugging) {
        console.log('🧠 AI Analysis:', analysis);
      }

      return analysis;
      
    } catch (error) {
      console.error('❌ Error analyzing user intent:', error);
      
      // Fallback to simple heuristic analysis
      const query = request.userQuery.toLowerCase();
      const requiresBrowser = query.includes('navigate') || 
                             query.includes('visit') ||
                             query.includes('click') ||
                             query.includes('go to') ||
                             query.includes('open') ||
                             query.includes('browse') ||
                             query.includes('search for');
      
      return {
        requiresBrowserAutomation: requiresBrowser,
        intent: requiresBrowser ? 'User wants to perform browser actions' : 'User query can be handled without browser automation',
        confidence: requiresBrowser ? 0.7 : 0.9,
        reasoning: 'Based on query keywords and fallback analysis',
        suggestedActions: requiresBrowser ? 
          ['navigate to page', 'perform user actions'] : 
          ['provide direct answer']
      };
    }
  }

  /**
   * Create an automation task based on AI analysis
   */
  private async createAutomationTask(request: BrowserAgentRequest, analysis: any): Promise<AutomationTask | null> {
    try {
      if (analysis.navigation) {
        return browserAutomation.createNavigationTask(
          analysis.navigation.targetUrl,
          `Navigate to ${analysis.navigation.targetUrl} for ${analysis.navigation.purpose}`,
          analysis.intent
        );
      }

      if (analysis.interaction) {
        return browserAutomation.createInteractionTask(
          analysis.interaction.action,
          analysis.interaction.target,
          analysis.interaction.value,
          `${analysis.interaction.action} on ${analysis.interaction.target}${analysis.interaction.value ? ` with "${analysis.interaction.value}"` : ''}`
        );
      }

      if (analysis.extraction) {
        return browserAutomation.createExtractionTask(
          [analysis.extraction.target],
          analysis.extraction.type,
          `Extract ${analysis.extraction.type} from ${analysis.extraction.target}`
        );
      }

      // Fallback: try to infer from the request
      const query = request.userQuery.toLowerCase();
      
      if (query.includes('navigate') || query.includes('visit') || query.includes('go to')) {
        const urlMatch = request.userQuery.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.(com|org|net|gov|edu)[^\s]*)/i);
        if (urlMatch) {
          const url = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
          return browserAutomation.createNavigationTask(url, request.userQuery, analysis.intent);
        }
      }

      if (query.includes('click') || query.includes('press')) {
        return browserAutomation.createInteractionTask(
          'click',
          'element-to-be-determined',
          undefined,
          request.userQuery
        );
      }

      console.warn('⚠️ Could not determine specific automation action from analysis');
      return null;
      
    } catch (error) {
      console.error('❌ Error creating automation task:', error);
      return null;
    }
  }

  /**
   * Generate next steps based on task result
   */
  private generateNextSteps(result: TaskResult, analysis: any): string[] {
    const nextSteps: string[] = [];
    
    if (result.success) {
      nextSteps.push('Task completed successfully');
      nextSteps.push('Browser session remains active for additional actions');
      
      if (analysis.intent.includes('navigate')) {
        nextSteps.push('Ready for interaction on the current page');
      }
    } else {
      nextSteps.push('Task failed - review error details');
      nextSteps.push('Consider retrying with modified parameters');
      nextSteps.push('Check browser state and target elements');
    }
    
    return nextSteps;
  }

  /**
   * Get agent status and capabilities
   */
  getStatus(): {
    enabled: boolean;
    sessionInfo: ReturnType<typeof browserAutomation.getSessionInfo>;
    availableTools: Promise<string[]>;
    aiModel: string;
  } {
    return {
      enabled: this.isEnabled,
      sessionInfo: browserAutomation.getSessionInfo(),
      availableTools: browserAutomation.getAvailableTools(),
      aiModel: this.config.modelName
    };
  }

  /**
   * Disable the browser agent integration
   */
  async disable(): Promise<void> {
    if (!this.isEnabled) return;

    console.log('🛑 Disabling AI Browser Agent...');
    
    await browserAutomation.cleanup();
    
    this.isEnabled = false;
    
    console.log('✅ AI Browser Agent disabled');
  }

  /**
   * Get recent task history
   */
  getRecentTasks(limit: number = 10): TaskResult[] {
    const tasks = Array.from(this.taskResults?.values?.() || []);
    return tasks.slice(-limit);
  }
}

// Export singleton instance
export const agentBrowser = new AgentBrowserIntegration({
  googleApiKey: process.env.GOOGLE_API_KEY || 'your-google-api-key-here'
});
