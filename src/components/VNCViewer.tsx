'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VNCClient } from '@/utils/vnc-client';
import { VNCConfig } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface VNCViewerProps {
  vncConfig: VNCConfig;
  onConnectionChange: (connected: boolean) => void;
  className?: string;
}

export const VNCViewer: React.FC<VNCViewerProps> = ({ vncConfig, onConnectionChange, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [vncClient, setVncClient] = useState<VNCClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = new VNCClient(
      vncConfig,
      () => {
        setIsConnected(true);
        onConnectionChange(true);
      },
      () => {
        setIsConnected(false);
        onConnectionChange(false);
      },
      (data) => {
        // In a real implementation, you would decode the image data and draw it to the canvas
        // For this conceptual implementation, we'll just log the data
        console.log('Received screen update:', data);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Draw a placeholder rectangle to signify a screen update
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
            ctx.fillRect(data.x, data.y, data.width, data.height);
          }
        }
      }
    );
    setVncClient(client);
    client.connect();

    return () => {
      client.disconnect();
    };
  }, [vncConfig, onConnectionChange]);


  return (
    <Card className={className}>
      <CardContent className="p-0">
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <span className="ml-2 text-white">Connecting to VNC...</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={vncConfig.width}
          height={vncConfig.height}
          className="w-full h-full"
        />
      </CardContent>
    </Card>
  );
};
