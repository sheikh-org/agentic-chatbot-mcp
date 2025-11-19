import { VNCConfig } from '@/types';

export class VNCClient {
  private ws: WebSocket | null = null;
  private config: VNCConfig;
  private onConnected: () => void;
  private onDisconnected: () => void;
  private onScreenUpdate: (data: any) => void;

  constructor(config: VNCConfig, onConnected: () => void, onDisconnected: () => void, onScreenUpdate: (data: any) => void) {
    this.config = config;
    this.onConnected = onConnected;
    this.onDisconnected = onDisconnected;
    this.onScreenUpdate = onScreenUpdate;
  }

  public connect(): void {
    this.ws = new WebSocket(`ws://${this.config.host}:3001`);

    this.ws.onopen = () => {
      console.log('VNC WebSocket connected');
      this.onConnected();
      this.sendMessage('vnc_connect', this.config);
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'vnc_screen_update') {
        this.onScreenUpdate(message.data);
      }
    };

    this.ws.onclose = () => {
      console.log('VNC WebSocket disconnected');
      this.onDisconnected();
    };

    this.ws.onerror = (error) => {
      console.error('VNC WebSocket error:', error);
    };
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }

  private sendMessage(type: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }
}
