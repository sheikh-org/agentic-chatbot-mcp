import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentConfig } from '@/types';

export class GoogleGenerativeAIProvider {
  private genAI: GoogleGenerativeAI;
  private config: AgentConfig;

  constructor(apiKey: string, config: AgentConfig) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.config = config;
  }

  public async generateText(prompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.config.model });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
