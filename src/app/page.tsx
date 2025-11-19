'use client';

import React, { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { VNCViewer } from '@/components/VNCViewer';
import { VNCConfig } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const [apiKey, setApiKey] = useState<string>('');
  const [vncConfig, setVncConfig] = useState<VNCConfig>({
    host: process.env.NEXT_PUBLIC_VNC_HOST || 'localhost',
    port: parseInt(process.env.NEXT_PUBLIC_VNC_PORT || '5900'),
    password: process.env.NEXT_PUBLIC_VNC_PASSWORD || '',
    width: 1024,
    height: 768,
    depth: 24,
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [showVNC, setShowVNC] = useState(false);

  useEffect(() => {
    // Load API key from localStorage if available
    const savedApiKey = localStorage.getItem('google_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    // Check environment variables
    const envApiKey = process.env.GOOGLE_API_KEY;
    if (envApiKey && envApiKey !== 'your_google_api_key_here') {
      setApiKey(envApiKey);
      localStorage.setItem('google_api_key', envApiKey);
    }

    // Check VNC configuration
    if (process.env.NEXT_PUBLIC_VNC_ENABLED === 'true') {
      setShowVNC(true);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    if (!key.trim()) {
      setConfigError('Please enter a valid Google API key');
      return;
    }

    if (!key.startsWith('AIza')) {
      setConfigError('Google API keys typically start with "AIza"');
      return;
    }

    setApiKey(key);
    localStorage.setItem('google_api_key', key);
    setConfigError(null);
    setIsConfigured(true);
  };

  const handleVNCConfigChange = (newConfig: Partial<VNCConfig>) => {
    setVncConfig(prev => ({ ...prev, ...newConfig }));
  };

  if (!isConfigured || !apiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Agentic Chatbot Setup</CardTitle>
            <CardDescription className="text-center">
              Configure your Google API key and VNC settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Google API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google API key (starts with AIza)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your key from{' '}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {showVNC && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">VNC Host</label>
                  <input
                    type="text"
                    value={vncConfig.host}
                    onChange={(e) => handleVNCConfigChange({ host: e.target.value })}
                    placeholder="localhost"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">VNC Port</label>
                  <input
                    type="number"
                    value={vncConfig.port}
                    onChange={(e) => handleVNCConfigChange({ port: parseInt(e.target.value) })}
                    placeholder="5900"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    VNC Password (optional)
                  </label>
                  <input
                    type="password"
                    value={vncConfig.password}
                    onChange={(e) => handleVNCConfigChange({ password: e.target.value })}
                    placeholder="Leave empty if no password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {configError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {configError}
                </AlertDescription>
              </Alert>
            )}

            <button
              onClick={() => handleApiKeySubmit(apiKey)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Start Agentic Chatbot
            </button>

            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Google Generative AI Integration</span>
              </div>
              {showVNC && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>VNC Remote Desktop Access</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Real-time Agent Communication</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Screen Analysis & Control</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto p-4">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <span>Chat Interface</span>
            </TabsTrigger>
            {showVNC && (
              <TabsTrigger value="vnc" className="flex items-center space-x-2">
                <span>VNC Viewer</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <ChatInterface 
              apiKey={apiKey} 
              vncConfig={showVNC ? vncConfig : undefined} 
            />
          </TabsContent>

          {showVNC && (
            <TabsContent value="vnc" className="space-y-4">
              <div className="max-w-4xl mx-auto">
                <VNCViewer 
                  vncConfig={vncConfig}
                  onConnectionChange={(connected) => {
                    console.log('VNC connection status:', connected);
                  }}
                  className="h-full"
                />
                
                {/* VNC Information Panel */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">VNC Connection Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Host:</span>
                        <span className="ml-2 text-gray-600">{vncConfig.host}</span>
                      </div>
                      <div>
                        <span className="font-medium">Port:</span>
                        <span className="ml-2 text-gray-600">{vncConfig.port}</span>
                      </div>
                      <div>
                        <span className="font-medium">Resolution:</span>
                        <span className="ml-2 text-gray-600">
                          {vncConfig.width}×{vncConfig.height}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Color Depth:</span>
                        <span className="ml-2 text-gray-600">{vncConfig.depth}-bit</span>
                      </div>
                    </div>
                    
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>VNC Integration:</strong> This viewer connects to a VNC server to provide 
                        real-time remote desktop access. The agent can analyze screen content and interact 
                        with applications through this connection.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}