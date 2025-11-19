'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AgenticChatbot } from '@/utils/agentic-chatbot';
import { ChatMessage, VNCConfig } from '@/types';
import { 
  MessageSquare, 
  Monitor, 
  Settings, 
  Send, 
  Square,
  Circle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ChatInterfaceProps {
  apiKey: string;
  vncConfig?: VNCConfig;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  apiKey, 
  vncConfig 
}) => {
  const [chatbot, setChatbot] = useState<AgenticChatbot | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [vncConnected, setVncConnected] = useState(false);
  const [agentStatus, setAgentStatus] = useState('Initializing...');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (apiKey) {
      initializeChatbot();
    }
  }, [apiKey]);

  const initializeChatbot = () => {
    try {
      const newChatbot = new AgenticChatbot(apiKey, vncConfig);
      
      // Setup event handlers
      newChatbot.on('agent_response', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
      });

      newChatbot.on('agent_decision', (decision: any) => {
        console.log('Agent decision:', decision);
      });

      newChatbot.on('vnc_connected', () => {
        setVncConnected(true);
        setAgentStatus('Connected to VNC');
      });

      newChatbot.on('vnc_disconnected', () => {
        setVncConnected(false);
        setAgentStatus('VNC disconnected');
      });

      setChatbot(newChatbot);
      setAgentStatus('Agent initialized and ready');

      // Send welcome message
      setTimeout(() => {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: 'Hello! I\'m your agentic chatbot with VNC capabilities. I can interact with computer systems, analyze screens, and help you with various tasks. How can I assist you today?',
          timestamp: new Date(),
          metadata: { agent_type: 'welcome' }
        }]);
      }, 1000);
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
      setAgentStatus('Initialization failed');
    }
  };

  const handleSendMessage = async () => {
    if (!chatbot || !inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setAgentStatus('Processing your request...');

    try {
      const response = await chatbot.processUserMessage(userMessage.content);
      console.log('Bot response:', response);
    } catch (error) {
      console.error('Error sending message:', error);
      setAgentStatus('Error processing request');
    } finally {
      setIsLoading(false);
      setAgentStatus('Ready');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const connectVNC = async () => {
    if (chatbot) {
      setAgentStatus('Connecting to VNC...');
      try {
        const connected = await chatbot.connectVNC();
        if (connected) {
          setAgentStatus('Connected to VNC');
        } else {
          setAgentStatus('VNC connection failed');
        }
      } catch (error) {
        console.error('VNC connection error:', error);
        setAgentStatus('VNC connection failed');
      }
    }
  };

  const disconnectVNC = () => {
    if (chatbot) {
      chatbot.disconnectVNC();
      setAgentStatus('VNC disconnected');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (vncConnected) return <Circle className="w-4 h-4 text-green-500 fill-current" />;
    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusColor = () => {
    if (isLoading) return 'text-blue-600';
    if (vncConnected) return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Agentic Chatbot with VNC</h1>
              <div className="flex items-center space-x-2 text-sm opacity-90">
                {getStatusIcon()}
                <span className={getStatusColor()}>{agentStatus}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {vncConfig && (
              <div className="flex items-center space-x-2">
                {vncConnected ? (
                  <button
                    onClick={disconnectVNC}
                    className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    <span>Disconnect VNC</span>
                  </button>
                ) : (
                  <button
                    onClick={connectVNC}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Connect VNC</span>
                  </button>
                )}
              </div>
            )}
            <Settings className="w-5 h-5 cursor-pointer hover:opacity-80" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Start a conversation with your agentic assistant!</p>
            <p className="text-sm mt-2">
              {vncConfig ? 'Try asking me to analyze your screen or control applications.' : 'Configure VNC to enable screen interaction capabilities.'}
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm border'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
                {message.metadata?.tools_used && message.metadata.tools_used.length > 0 && (
                  <span className="ml-2">
                    • Used: {message.metadata.tools_used.join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Agent is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};