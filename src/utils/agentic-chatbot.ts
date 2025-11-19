import { GoogleGenerativeAIProvider } from './ai-provider';
import { VNCClient } from './vnc-client';
import { AgentConfig, ChatMessage, AgentDecision, AgentState, VNCConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class AgenticChatbot {
  private aiProvider: GoogleGenerativeAIProvider;
  private vncClient: VNCClient | null = null;
  private config: AgentConfig;
  private state: AgentState;
  private messageHistory: ChatMessage[] = [];
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(
    googleApiKey: string,
    vncConfig?: VNCConfig,
    customConfig?: Partial<AgentConfig>
  ) {
    this.aiProvider = new GoogleGenerativeAIProvider(googleApiKey);
    
    // Default configuration
    this.config = {
      name: 'Agentic Assistant',
      description: 'An intelligent agent capable of both conversation and system interaction',
      capabilities: [
        'Natural language conversation',
        'Screen analysis and interaction',
        'Tool execution and automation',
        'Real-time system monitoring',
        'Contextual assistance',
      ],
      max_iterations: 10,
      temperature: 0.7,
      system_prompt: 'You are a helpful AI assistant that can interact with computer systems through VNC. You can analyze screens, control applications, and help users with various tasks. Be proactive in suggesting actions and always ask for confirmation before making system changes.',
      tools: [
        {
          name: 'vnc_capture',
          description: 'Capture current screen content for analysis',
          parameters: {},
          handler: () => this.captureScreen(),
        },
        {
          name: 'vnc_mouse_click',
          description: 'Click at specific screen coordinates',
          parameters: { x: 'number', y: 'number', button: 'number' },
          handler: (params: any) => this.sendMouseClick(params.x, params.y, params.button),
        },
        {
          name: 'vnc_keyboard_type',
          description: 'Type text at current cursor position',
          parameters: { text: 'string' },
          handler: (params: any) => this.sendKeyboardInput(params.text),
        },
        {
          name: 'system_info',
          description: 'Get current system status and information',
          parameters: {},
          handler: () => this.getSystemInfo(),
        },
      ],
      ...customConfig,
    };

    this.state = {
      taskHistory: [],
      availableTools: this.config.tools.map(tool => tool.name),
    };

    if (vncConfig) {
      this.vncClient = new VNCClient(vncConfig);
      this.setupVNCEventHandlers();
    }
  }

  async processUserMessage(userInput: string): Promise<string> {
    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      };
      this.messageHistory.push(userMessage);

      // Make agent decision about how to respond
      const decision = await this.aiProvider.makeAgentDecision(
        userInput,
        this.state,
        this.state.availableTools
      );

      this.emit('agent_decision', decision);

      let response = '';
      let toolsUsed: string[] = [];

      switch (decision.action) {
        case 'use_tool':
          // Execute requested tools
          if (decision.tool_calls && decision.tool_calls.length > 0) {
            for (const toolName of decision.tool_calls) {
              try {
                const toolResult = await this.executeTool(toolName, {});
                toolsUsed.push(toolName);
                
                if (typeof toolResult === 'string') {
                  response += toolResult + '\n\n';
                }
              } catch (toolError) {
                console.error(`Tool ${toolName} failed:`, toolError);
                response += `Failed to execute ${toolName}: ${toolError.message}\n\n`;
              }
            }
          }
          // Add AI response
          response += decision.suggested_response || 'I\'ve completed the requested actions.';
          break;

        case 'request_vnc':
          if (!this.vncClient) {
            response = 'VNC connection is not available. Please connect to a VNC server first.';
          } else {
            const screenContent = await this.captureScreen();
            response = `Current screen analysis:\n${screenContent}\n\n${decision.suggested_response || 'I can see the current screen. How can I help you interact with it?'}`;
          }
          break;

        case 'analyze_screen':
          if (this.vncClient) {
            const screenAnalysis = await this.aiProvider.analyzeScreenContent(
              await this.captureScreen()
            );
            response = `Screen Analysis:\n${screenAnalysis}\n\n${decision.suggested_response || 'I can see several interactive elements on the screen.'}`;
          } else {
            response = 'Screen analysis requires VNC connection.';
          }
          break;

        case 'respond':
        default:
          // Generate AI response
          const aiResponse = await this.aiProvider.generateResponse(
            this.messageHistory,
            this.config
          );
          response = aiResponse.text;
          break;
      }

      // Add assistant message to history
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: {
          agent_type: 'agentic_chatbot',
          tools_used: toolsUsed,
          confidence: decision.confidence,
        },
      };
      this.messageHistory.push(assistantMessage);

      this.emit('agent_response', assistantMessage);

      return response;
    } catch (error) {
      console.error('Error processing user message:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        metadata: { agent_type: 'error_handler' },
      };
      this.messageHistory.push(errorMessage);
      return errorMessage.content;
    }
  }

  private async executeTool(toolName: string, parameters: any): Promise<any> {
    const tool = this.config.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    console.log(`Executing tool: ${toolName}`, parameters);
    return await tool.handler(parameters);
  }

  private async captureScreen(): Promise<string> {
    if (!this.vncClient) {
      throw new Error('VNC client not initialized');
    }
    return await this.vncClient.captureScreen();
  }

  private async sendMouseClick(x: number, y: number, button: number = 1): Promise<string> {
    if (!this.vncClient) {
      throw new Error('VNC client not initialized');
    }
    
    // Send mouse click event
    this.vncClient.sendMouseEvent({
      x,
      y,
      button,
      pressed: true,
    });

    return `Clicked at position (${x}, ${y})`;
  }

  private async sendKeyboardInput(text: string): Promise<string> {
    if (!this.vncClient) {
      throw new Error('VNC client not initialized');
    }

    // Send keyboard events for each character
    for (const char of text) {
      this.vncClient.sendKeyboardEvent({
        key: char,
        pressed: true,
      });
    }

    return `Typed text: "${text}"`;
  }

  private async getSystemInfo(): Promise<string> {
    const info = {
      vnc_connected: this.vncClient?.getState()?.isConnected || false,
      streaming_active: this.vncClient?.getState()?.isStreaming || false,
      tasks_completed: this.state.taskHistory.length,
      messages_exchanged: this.messageHistory.length,
      available_tools: this.state.availableTools,
    };

    return `System Status:\n${JSON.stringify(info, null, 2)}`;
  }

  async connectVNC(): Promise<boolean> {
    if (!this.vncClient) {
      throw new Error('VNC client not initialized');
    }

    try {
      const connected = await this.vncClient.connect();
      if (connected) {
        this.state.vncState = this.vncClient.getState();
      }
      return connected;
    } catch (error) {
      console.error('Failed to connect VNC:', error);
      return false;
    }
  }

  disconnectVNC(): void {
    if (this.vncClient) {
      this.vncClient.disconnect();
      this.state.vncState = this.vncClient.getState();
    }
  }

  getState(): AgentState {
    return { ...this.state };
  }

  getMessageHistory(): ChatMessage[] {
    return [...this.messageHistory];
  }

  clearHistory(): void {
    this.messageHistory = [];
  }

  // Event system
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  private setupVNCEventHandlers(): void {
    if (!this.vncClient) return;

    this.vncClient.on('connected', () => {
      console.log('VNC connected successfully');
      this.emit('vnc_connected', {});
    });

    this.vncClient.on('disconnected', () => {
      console.log('VNC disconnected');
      this.emit('vnc_disconnected', {});
    });

    this.vncClient.on('error', (error) => {
      console.error('VNC error:', error);
      this.emit('vnc_error', error);
    });

    this.vncClient.on('screen_update', (update) => {
      this.emit('vnc_screen_update', update);
    });
  }
}