import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, AgentConfig, AgentDecision, AIResponse } from '@/types';

export class GoogleGenerativeAIProvider {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateResponse(
    messages: ChatMessage[],
    config: AgentConfig
  ): Promise<AIResponse> {
    try {
      // Prepare the conversation context
      const chat = this.model.startChat({
        history: this.convertMessagesToHistory(messages.slice(0, -1)),
        generationConfig: {
          temperature: config.temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      });

      // Get the latest user message
      const latestMessage = messages[messages.length - 1];
      const systemPrompt = this.buildSystemPrompt(config);

      // Send message with system context
      const result = await chat.sendMessage(
        `${systemPrompt}\n\nUser: ${latestMessage.content}`
      );

      const response = result.response;
      const text = response.text();

      return {
        text,
        usage: {
          promptTokens: this.estimateTokenCount(messages),
          completionTokens: this.estimateTokenCount([{ content: text }]),
          totalTokens: this.estimateTokenCount(messages) + this.estimateTokenCount([{ content: text }]),
        },
        finishReason: response.response.candidates?.[0]?.finishReason || 'STOP',
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  async makeAgentDecision(
    userMessage: string,
    currentState: any,
    availableTools: string[]
  ): Promise<AgentDecision> {
    try {
      const decisionPrompt = `
You are an intelligent agent that must decide how to respond to user requests.

Current context:
- User message: "${userMessage}"
- Available tools: ${availableTools.join(', ')}
- Current state: ${JSON.stringify(currentState, null, 2)}

Your decision should be one of:
1. "respond" - You can handle this directly with a conversational response
2. "use_tool" - You need to use one or more of the available tools
3. "request_vnc" - You need to access the VNC screen for context or control
4. "analyze_screen" - You need to analyze what's currently on the screen
5. "unknown" - You're unsure how to proceed

Please respond with a JSON object containing:
{
  "action": "your_decision",
  "confidence": 0.0-1.0,
  "reasoning": "explanation of your decision",
  "suggested_response": "what you would say to the user",
  "tool_calls": ["tool1", "tool2"] (if using tools)
}

Be confident but honest about your capabilities.
      `;

      const result = await this.model.generateContent(decisionPrompt);
      const response = result.response;
      const text = response.text();

      try {
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Failed to parse decision JSON:', parseError);
      }

      // Fallback decision
      return {
        action: 'respond',
        confidence: 0.5,
        reasoning: 'Unable to parse structured decision, defaulting to response',
        suggested_response: 'I understand your request. Let me help you with that.',
      };
    } catch (error) {
      console.error('Error making agent decision:', error);
      return {
        action: 'respond',
        confidence: 0.1,
        reasoning: 'Error in decision-making process',
        suggested_response: 'I apologize, but I\'m having trouble processing your request right now.',
      };
    }
  }

  async analyzeScreenContent(screenDescription: string): Promise<string> {
    try {
      const analysisPrompt = `
Analyze the following screen content and identify:
1. What applications/windows are visible
2. Any interactive elements (buttons, links, forms, etc.)
3. Any error messages or important notifications
4. Recommended actions for a user
5. Any text that might be relevant for a chatbot to reference

Screen description: ${screenDescription}

Provide a concise but comprehensive analysis.
      `;

      const result = await this.model.generateContent(analysisPrompt);
      return result.response.text();
    } catch (error) {
      console.error('Error analyzing screen content:', error);
      return 'Unable to analyze screen content due to error.';
    }
  }

  private convertMessagesToHistory(messages: ChatMessage[]): any[] {
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
  }

  private buildSystemPrompt(config: AgentConfig): string {
    return `${config.system_prompt}

You are ${config.name}, an intelligent agent with the following capabilities:
${config.capabilities.map(cap => `- ${cap}`).join('\n')}

Available tools: ${config.tools.map(tool => tool.name).join(', ')}

Always be helpful, accurate, and transparent about your capabilities and limitations.`;
  }

  private estimateTokenCount(messages: ChatMessage[] | { content: string }[]): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return messages.reduce((total, msg) => {
      const content = 'content' in msg ? msg.content : '';
      return total + Math.ceil(content.length / 4);
    }, 0);
  }
}