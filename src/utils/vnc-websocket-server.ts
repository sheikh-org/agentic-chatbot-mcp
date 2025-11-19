import { WebSocketServer, WebSocket } from 'ws';

export class VNCWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private screenUpdateInterval: NodeJS.Timeout;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.setupConnectionHandlers();
    this.screenUpdateInterval = setInterval(() => this.broadcastScreenUpdate(), 1000);
    console.log(`VNC WebSocket server started on port ${port}`);
  }

  private setupConnectionHandlers(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection for VNC');
      this.clients.add(ws);

      ws.on('message', (message: string) => {
        console.log('Received message from VNC client:', message);
      });

      ws.on('close', () => {
        console.log('VNC WebSocket connection closed');
        this.clients.delete(ws);
      });
    });
  }

  private broadcastScreenUpdate(): void {
    const mockUpdate = {
      type: 'vnc_screen_update',
      data: {
        x: Math.floor(Math.random() * 800),
        y: Math.floor(Math.random() * 600),
        width: 100,
        height: 100,
        timestamp: new Date()
      }
    };
    const message = JSON.stringify(mockUpdate);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public close(): void {
    clearInterval(this.screenUpdateInterval);
    this.wss.close();
  }
}
