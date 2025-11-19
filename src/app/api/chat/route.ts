import { NextRequest, NextResponse } from 'next/server';
import { AgenticChatbot } from '@/utils/agentic-chatbot';
import { AgentConfig } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { message, apiKey } = await req.json();

    if (!message || !apiKey) {
      return NextResponse.json({ error: 'Message and API key are required' }, { status: 400 });
    }

    const config: AgentConfig = {
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 1024,
      topP: 0.95,
      topK: 40,
    };

    const chatbot = new AgenticChatbot(apiKey, config);
    const response = await chatbot.processRequest(message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
