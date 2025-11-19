import { VNCConfig, VNCState, VNCScreenUpdate, VNCMouseEvent, VNCKeyboardEvent } from '@/types';

export class VNCClient {
  private config: VNCConfig;
  private state: VNCState;
  private socket: WebSocket | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(config: VNCConfig) {
    this.config = config;
    this.state = {
      isConnected: false,
      isStreaming: false,
      isAuthenticated: false,
    };
  }

  async connect(): Promise<boolean> {
    try {
      const wsUrl = `ws://${this.config.host}:${this.config.port}`;
      this.socket = new WebSocket(wsUrl);

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Failed to create WebSocket'));
          return;
        }

        this.socket.onopen = () => {
          console.log('VNC: Connected to VNC server');
          this.state.isConnected = true;
          this.authenticate();
          this.emit('connected', {});
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onclose = () => {
          console.log('VNC: Disconnected from VNC server');
          this.state.isConnected = false;
          this.state.isStreaming = false;
          this.emit('disconnected', {});
        };

        this.socket.onerror = (error) => {
          console.error('VNC: Connection error:', error);
          this.state.error = 'Connection failed';
          this.emit('error', { error: 'Connection failed' });
          reject(error);
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.state.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      });
    } catch (error) {
      console.error('VNC: Failed to connect:', error);
      this.state.error = error.message;
      return false;
    }
  }

  private authenticate(): void {
    // Send authentication if password is provided
    if (this.config.password) {
      const authMessage = this.createAuthenticationMessage(this.config.password);
      this.socket?.send(authMessage);
    } else {
      this.state.isAuthenticated = true;
      this.startDesktopSession();
    }
  }

  private createAuthenticationMessage(password: string): Uint8Array {
    // Simple VNC authentication (this is a simplified version)
    // In a real implementation, you'd use proper VNC authentication protocol
    const encoder = new TextEncoder();
    return encoder.encode(password);
  }

  private handleMessage(data: any): void {
    if (typeof data === 'string') {
      try {
        const message = JSON.parse(data);
        this.processMessage(message);
      } catch (error) {
        console.error('VNC: Failed to parse message:', error);
      }
    } else {
      // Binary data - likely screen update
      this.processScreenUpdate(new Uint8Array(data));
    }
  }

  private processMessage(message: any): void {
    switch (message.type) {
      case 'authentication_success':
        this.state.isAuthenticated = true;
        this.startDesktopSession();
        break;
      case 'authentication_failed':
        this.state.error = 'Authentication failed';
        this.emit('error', { error: 'Authentication failed' });
        break;
      case 'desktop_ready':
        this.state.isStreaming = true;
        this.emit('streaming_started', {});
        break;
      case 'error':
        this.state.error = message.error;
        this.emit('error', message);
        break;
    }
  }

  private startDesktopSession(): void {
    // Request desktop size and start receiving updates
    const startMessage = {
      type: 'start_session',
      width: this.config.width,
      height: this.config.height,
      depth: this.config.depth,
    };
    
    this.socket?.send(JSON.stringify(startMessage));
  }

  private processScreenUpdate(data: Uint8Array): void {
    if (!this.canvas || !this.ctx) return;

    try {
      // Simplified screen update processing
      // In a real VNC implementation, you'd parse the RFB protocol
      const imageData = this.ctx.createImageData(this.config.width, this.config.height);
      
      // Convert binary data to RGBA (this is simplified)
      for (let i = 0; i < data.length && i < imageData.data.length; i += 4) {
        imageData.data[i] = data[i] || 0;     // Red
        imageData.data[i + 1] = data[i + 1] || 0; // Green
        imageData.data[i + 2] = data[i + 2] || 0; // Blue
        imageData.data[i + 3] = 255;          // Alpha
      }

      this.ctx.putImageData(imageData, 0, 0);

      const screenUpdate: VNCScreenUpdate = {
        x: 0,
        y: 0,
        width: this.config.width,
        height: this.config.height,
        data,
      };

      this.emit('screen_update', screenUpdate);
    } catch (error) {
      console.error('VNC: Failed to process screen update:', error);
    }
  }

  setupCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (this.ctx) {
      canvas.width = this.config.width;
      canvas.height = this.config.height;
    }
  }

  sendMouseEvent(event: VNCMouseEvent): void {
    if (this.state.isStreaming && this.socket) {
      const message = {
        type: 'mouse_event',
        x: event.x,
        y: event.y,
        button: event.button,
        pressed: event.pressed,
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  sendKeyboardEvent(event: VNCKeyboardEvent): void {
    if (this.state.isStreaming && this.socket) {
      const message = {
        type: 'keyboard_event',
        key: event.key,
        pressed: event.pressed,
      };
      this.socket.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.state.isConnected = false;
    this.state.isStreaming = false;
    this.state.isAuthenticated = false;
  }

  getState(): VNCState {
    return { ...this.state };
  }

  // Event system
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`VNC: Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Capture current screen content for AI analysis
  async captureScreen(): Promise<string> {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not initialized');
    }

    // In a real implementation, you'd extract text from the canvas
    // and use OCR or other methods to describe what's visible
    return `Screen capture: ${this.config.width}x${this.config.height} desktop view`;
  }

  // Get current mouse position
  getMousePosition(canvas: HTMLCanvasElement, clientX: number, clientY: number): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = this.config.width / rect.width;
    const scaleY = this.config.height / rect.height;
    
    return {
      x: Math.floor((clientX - rect.left) * scaleX),
      y: Math.floor((clientY - rect.top) * scaleY),
    };
  }
}