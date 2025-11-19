'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { VNCConfig, VNCScreenUpdate, VNCMouseEvent, VNCKeyboardEvent } from '@/types';

interface VNCWebSocketHook {
  isConnected: boolean;
  isStreaming: boolean;
  connectionError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMouseEvent: (event: VNCMouseEvent) => void;
  sendKeyboardEvent: (event: VNCKeyboardEvent) => void;
  requestScreen: () => void;
  lastScreenUpdate: VNCScreenUpdate | null;
}

export const useVNCWebSocket = (config: VNCConfig, autoConnect = true): VNCWebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastScreenUpdate, setLastScreenUpdate] = useState<VNCScreenUpdate | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(async () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const wsUrl = `ws://localhost:3001`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('VNC WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;

        // Send VNC connection request
        ws.current?.send(JSON.stringify({
          type: 'vnc_connect',
          data: config
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('VNC WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsStreaming(false);
        
        // Attempt to reconnect if it wasn't a manual close
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, 2000 * reconnectAttempts.current); // Exponential backoff
        } else {
          setConnectionError('Max reconnection attempts reached');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection failed');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to create connection');
    }
  }, [config]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    reconnectAttempts.current = 0;
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
    setIsStreaming(false);
    setConnectionError(null);
  }, []);

  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'vnc_connected':
        console.log('VNC connection established:', message.data);
        setConnectionError(null);
        break;

      case 'vnc_streaming':
        setIsStreaming(true);
        console.log('VNC streaming started');
        break;

      case 'vnc_screen_update':
        setLastScreenUpdate(message.data);
        break;

      case 'vnc_error':
        setConnectionError(message.data.error || 'VNC error occurred');
        console.error('VNC error:', message.data);
        break;

      case 'error':
        setConnectionError(message.data.error);
        console.error('WebSocket error:', message.data);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const sendMouseEvent = useCallback((event: VNCMouseEvent) => {
    if (ws.current?.readyState === WebSocket.OPEN && isConnected) {
      ws.current.send(JSON.stringify({
        type: 'vnc_mouse_event',
        data: event
      }));
    }
  }, [isConnected]);

  const sendKeyboardEvent = useCallback((event: VNCKeyboardEvent) => {
    if (ws.current?.readyState === WebSocket.OPEN && isConnected) {
      ws.current.send(JSON.stringify({
        type: 'vnc_keyboard_event',
        data: event
      }));
    }
  }, [isConnected]);

  const requestScreen = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN && isConnected) {
      ws.current.send(JSON.stringify({
        type: 'vnc_request_screen'
      }));
    }
  }, [isConnected]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  return {
    isConnected,
    isStreaming,
    connectionError,
    connect,
    disconnect,
    sendMouseEvent,
    sendKeyboardEvent,
    requestScreen,
    lastScreenUpdate,
  };
};