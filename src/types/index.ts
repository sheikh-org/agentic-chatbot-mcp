import { GoogleGenerativeAI } from '@google/generative-ai';

// AI and Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    agent_type?: string;
    tools_used?: string[];
    confidence?: number;
    execution_time?: number;
  };
}

export interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  max_iterations: number;
  temperature: number;
  system_prompt: string;
  tools: ToolConfig[];
}

export interface ToolConfig {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: (params: any) => Promise<any>;
}

export interface VNCConfig {
  host: string;
  port: number;
  password?: string;
  width: number;
  height: number;
  depth: number;
}

export interface VNCState {
  isConnected: boolean;
  isStreaming: boolean;
  isAuthenticated: boolean;
  error?: string;
  connectionTime?: Date;
}

export interface VNCMouseEvent {
  x: number;
  y: number;
  button: number;
  pressed: boolean;
}

export interface VNCKeyboardEvent {
  key: string;
  pressed: boolean;
}

export interface VNCScreenUpdate {
  x: number;
  y: number;
  width: number;
  height: number;
  data: Uint8Array;
}

// AI SDK Integration Types
export interface AIGenerationConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  stream: boolean;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

// Agent Behavior Types
export interface AgentDecision {
  action: 'respond' | 'use_tool' | 'request_vnc' | 'analyze_screen' | 'unknown';
  confidence: number;
  reasoning: string;
  suggested_response?: string;
  tool_calls?: string[];
}

export interface AgentState {
  currentTask?: string;
  taskHistory: string[];
  availableTools: string[];
  vncState?: VNCState;
  lastScreenAnalysis?: {
    timestamp: Date;
    description: string;
    actionable_elements: string[];
  };
}

// Real-time Communication Types
export interface WebSocketMessage {
  type: 'vnc_data' | 'chat_message' | 'agent_decision' | 'tool_response' | 'error';
  payload: any;
  timestamp: Date;
  id?: string;
}

export interface ServerToClientEvents {
  'vnc-screen-update': (data: VNCScreenUpdate) => void;
  'agent-response': (message: ChatMessage) => void;
  'agent-decision': (decision: AgentDecision) => void;
  'tool-result': (result: any) => void;
  'error': (error: string) => void;
}

export interface ClientToServerEvents {
  'vnc-mouse-event': (event: VNCMouseEvent) => void;
  'vnc-keyboard-event': (event: VNCKeyboardEvent) => void;
  'chat-message': (message: string) => void;
  'agent-request': (request: string) => void;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}