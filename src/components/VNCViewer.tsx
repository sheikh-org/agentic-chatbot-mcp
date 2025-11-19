'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VNCClient } from '@/utils/vnc-client';
import { VNCConfig, VNCScreenUpdate, VNCMouseEvent } from '@/types';
import { Monitor, MousePointer, Keyboard, RotateCcw } from 'lucide-react';

interface VNCViewerProps {
  vncConfig: VNCConfig;
  onConnectionChange?: (connected: boolean) => void;
  className?: string;
}

export const VNCViewer: React.FC<VNCViewerProps> = ({ 
  vncConfig, 
  onConnectionChange,
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vncClient, setVncClient] = useState<VNCClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  const initializeVNC = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      const client = new VNCClient(vncConfig);
      client.setupCanvas(canvasRef.current);

      // Setup event handlers
      client.on('connected', () => {
        setIsConnected(true);
        setConnectionError(null);
        onConnectionChange?.(true);
        console.log('VNC: Connected successfully');
      });

      client.on('disconnected', () => {
        setIsConnected(false);
        setIsStreaming(false);
        onConnectionChange?.(false);
        console.log('VNC: Disconnected');
      });

      client.on('streaming_started', () => {
        setIsStreaming(true);
        console.log('VNC: Streaming started');
      });

      client.on('screen_update', (update: VNCScreenUpdate) => {
        setLastUpdate(new Date());
        // The screen update is handled by the VNC client internally
      });

      client.on('error', (error: any) => {
        setConnectionError(error.error || 'Unknown VNC error');
        console.error('VNC Error:', error);
      });

      setVncClient(client);

      // Attempt to connect
      const connected = await client.connect();
      if (connected) {
        console.log('VNC: Connection established');
      } else {
        setConnectionError('Failed to establish VNC connection');
      }

    } catch (error) {
      console.error('VNC: Initialization failed:', error);
      setConnectionError(error instanceof Error ? error.message : 'Initialization failed');
    }
  }, [vncConfig, onConnectionChange]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!vncClient || !canvasRef.current || !isConnected || !isStreaming) return;

    const position = vncClient.getMousePosition(
      canvasRef.current, 
      event.clientX, 
      event.clientY
    );
    setMousePosition(position);
  }, [vncClient, isConnected, isStreaming]);

  const handleMouseClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>, button: number = 1) => {
    if (!vncClient || !canvasRef.current || !isConnected || !isStreaming) return;

    const position = vncClient.getMousePosition(
      canvasRef.current, 
      event.clientX, 
      event.clientY
    );

    const mouseEvent: VNCMouseEvent = {
      x: position.x,
      y: position.y,
      button,
      pressed: true,
    };

    vncClient.sendMouseEvent(mouseEvent);
    console.log('VNC: Mouse click at', position);
  }, [vncClient, isConnected, isStreaming]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!vncClient || !isConnected || !isStreaming) return;

    const keyEvent = {
      key: event.key,
      pressed: event.type === 'keydown',
    };

    vncClient.sendKeyboardEvent(keyEvent);
  }, [vncClient, isConnected, isStreaming]);

  const disconnect = useCallback(() => {
    if (vncClient) {
      vncClient.disconnect();
      setVncClient(null);
    }
  }, [vncClient]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      initializeVNC();
    }, 1000);
  }, [disconnect, initializeVNC]);

  useEffect(() => {
    initializeVNC();

    return () => {
      disconnect();
    };
  }, [initializeVNC, disconnect]);

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Monitor className="w-5 h-5" />
          <span className="font-medium">VNC Viewer</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-300">
              {isConnected ? (isStreaming ? 'Streaming' : 'Connected') : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-xs text-gray-400">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={reconnect}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Reconnect"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative bg-black" style={{ aspectRatio: `${vncConfig.width}/${vncConfig.height}` }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseDown={(e) => handleMouseClick(e, 1)}
          onMouseUp={(e) => handleMouseClick(e, 1)}
          onKeyDown={handleKeyPress}
          onKeyUp={handleKeyPress}
          tabIndex={0}
        />

        {/* Connection Status Overlay */}
        {!isConnected && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              {connectionError ? (
                <>
                  <div className="text-red-400 mb-2">Connection Failed</div>
                  <div className="text-sm text-gray-300 mb-4">{connectionError}</div>
                  <button
                    onClick={reconnect}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
                  >
                    Retry Connection
                  </button>
                </>
              ) : (
                <>
                  <div className="animate-pulse mb-2">Connecting to VNC...</div>
                  <div className="text-sm text-gray-300">
                    {vncConfig.host}:{vncConfig.port}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mouse Position Indicator */}
        {mousePosition && isStreaming && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            <MousePointer className="w-3 h-3 inline mr-1" />
            {mousePosition.x}, {mousePosition.y}
          </div>
        )}

        {/* Stream Status */}
        {isConnected && !isStreaming && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-pulse mb-2">Starting screen sharing...</div>
              <div className="text-sm text-gray-300">Please wait</div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-100 p-2 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-600">
            <Keyboard className="w-4 h-4" />
            <span>Keyboard & Mouse Control</span>
          </div>
          <div className="text-gray-500">
            Resolution: {vncConfig.width}×{vncConfig.height}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleMouseClick({ 
              clientX: vncConfig.width / 2, 
              clientY: vncConfig.height / 2,
              currentTarget: canvasRef.current
            } as any, 2)}
            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs transition-colors"
            title="Center click"
          >
            Center
          </button>
          <button
            onClick={disconnect}
            className="px-2 py-1 bg-red-200 hover:bg-red-300 text-red-700 rounded text-xs transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};