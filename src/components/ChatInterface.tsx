'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [vncConnected, setVncConnected] = useState(false);
  const [agentStatus, setAgentStatus] = useState('Idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Send a welcome message when the component mounts
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your agentic chatbot with VNC capabilities. I can interact with computer systems, analyze screens, and help you with various tasks. How can I assist you today?',
      timestamp: new Date(),
    }]);
  }, []);


  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    setAgentStatus('Processing your request...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput, apiKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setAgentStatus('Idle');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // VNC connection functions are kept for future implementation
  const connectVNC = async () => {
    setAgentStatus('Connecting to VNC...');
    // Mock connection
    setTimeout(() => {
      setVncConnected(true);
      setAgentStatus('Connected to VNC');
    }, 1000);
  };

  const disconnectVNC = () => {
    setVncConnected(false);
    setAgentStatus('VNC disconnected');
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