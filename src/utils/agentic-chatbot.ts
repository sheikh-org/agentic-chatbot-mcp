import { GoogleGenerativeAIProvider } from './ai-provider';
import { AgentConfig, ToolConfig } from '@/types';

export class AgenticChatbot {
  private aiProvider: GoogleGenerativeAIProvider;
  private config: AgentConfig;
  private tools: Map<string, ToolConfig> = new Map();

  constructor(apiKey: string, config: AgentConfig) {
    this.aiProvider = new GoogleGenerativeAIProvider(apiKey, config);
    this.config = config;
    this.registerDummyTools();
  }

  private registerDummyTools(): void {
    this.registerTool({
      name: 'navigate_to_url',
      description: 'Navigates to a specified URL in the browser.',
      parameters: { url: 'string' },
      handler: async (params) => `Navigating to ${params.url}.`,
    });
    this.registerTool({
      name: 'get_page_content',
      description: 'Returns the content of the current page.',
      parameters: {},
      handler: async () => 'Returning the page content.',
    });
  }

  public registerTool(tool: ToolConfig): void {
    this.tools.set(tool.name, tool);
  }

  public async processRequest(prompt: string): Promise<string> {
    const toolPrompt = `You have the following tools available: ${[...this.tools.keys()].join(', ')}. Based on the user's request, should you use a tool? If so, which one? Otherwise, respond to the user directly.`;
    const decision = await this.aiProvider.generateText(`${toolPrompt}\n\nUser request: ${prompt}`);

    const toolToUse = [...this.tools.keys()].find(tool => decision.includes(tool));

    if (toolToUse) {
      const tool = this.tools.get(toolToUse);
      if (tool) {
        // In a real implementation, you would parse the parameters from the AI's response
        // For this conceptual implementation, we'll just use dummy parameters
        const params = { url: 'https://example.com' };
        return tool.handler(params);
      }
    }

    return this.aiProvider.generateText(prompt);
  }
}
