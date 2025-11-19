export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
