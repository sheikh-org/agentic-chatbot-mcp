// VNC Configuration and Demo Script
import { VNCConfig, ChatMessage } from '@/types';

// Default VNC configuration
export const DEFAULT_VNC_CONFIG: VNCConfig = {
  host: process.env.NEXT_PUBLIC_VNC_HOST || 'localhost',
  port: parseInt(process.env.NEXT_PUBLIC_VNC_PORT || '5900'),
  password: process.env.NEXT_PUBLIC_VNC_PASSWORD || '',
  width: parseInt(process.env.NEXT_PUBLIC_VNC_WIDTH || '1024'),
  height: parseInt(process.env.NEXT_PUBLIC_VNC_HEIGHT || '768'),
  depth: parseInt(process.env.NEXT_PUBLIC_VNC_DEPTH || '24'),
};

// Demo conversation scenarios
export const DEMO_CONVERSATIONS = {
  basic_greeting: [
    {
      role: 'user' as const,
      content: 'Hello! Can you help me with computer tasks?'
    },
    {
      role: 'assistant' as const,
      content: 'Hello! I\'m your agentic assistant with VNC capabilities. I can help you with various computer tasks including browser automation, form filling, and screen analysis. What would you like to work on?'
    }
  ],
  
  screen_analysis: [
    {
      role: 'user' as const,
      content: 'Can you analyze my current screen?'
    },
    {
      role: 'assistant' as const,
      content: 'I\'ll connect to your VNC session and analyze the current screen content for you. This will help me understand what you\'re working with and how I can assist you.'
    }
  ],
  
  web_browsing: [
    {
      role: 'user' as const,
      content: 'Open a web browser and search for "agentic AI"'
    },
    {
      role: 'assistant' as const,
      content: 'I\'ll help you browse the web! I can open a browser, navigate to search engines, and help you find information about agentic AI. This involves connecting to your VNC session and controlling the browser interface.'
    }
  ],
  
  form_filling: [
    {
      role: 'user' as const,
      content: 'I need help filling out a contact form'
    },
    {
      role: 'assistant' as const,
      content: 'I can definitely help with form filling! I can analyze form fields, identify required information, and help you fill them out efficiently. Do you have a specific form in mind, or should I help you locate one?'
    }
  ]
};

// Agent capabilities for demo purposes
export const DEMO_CAPABILITIES = [
  'Natural language conversation',
  'Browser automation and control',
  'Screen content analysis',
  'Form filling assistance',
  'Application launching',
  'File system navigation',
  'Real-time system monitoring',
  'Web scraping and data extraction'
];

// Example VNC connection scenarios
export const VNC_SCENARIOS = {
  local_desktop: {
    host: 'localhost',
    port: 5900,
    description: 'Local desktop session'
  },
  
  remote_server: {
    host: '192.168.1.100',
    port: 5901,
    description: 'Remote server desktop'
  },
  
  cloud_vm: {
    host: 'vm.example.com',
    port: 5902,
    description: 'Cloud virtual machine'
  }
};

// Testing utilities
export class DemoUtils {
  static async simulateAgentResponse(userMessage: string): Promise<string> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      "I understand your request. Let me help you with that using my VNC capabilities.",
      "I'll connect to your desktop and assist you with this task.",
      "Based on your request, I can analyze the screen and provide targeted assistance.",
      "This sounds like a great use case for my agentic capabilities and remote desktop control.",
      "I can help you accomplish this through VNC interaction and automated steps."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  static generateTestChatHistory(): ChatMessage[] {
    const history: ChatMessage[] = [];
    const timestamp = new Date();
    
    // Add welcome message
    history.push({
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to the Agentic Chatbot with VNC! I\'m ready to help you with computer tasks.',
      timestamp,
      metadata: { agent_type: 'welcome' }
    });
    
    // Add some sample interactions
    const sampleInteractions = [
      {
        role: 'user',
        content: 'What can you help me with?'
      },
      {
        role: 'assistant', 
        content: 'I can help you with browser automation, screen analysis, form filling, and various computer tasks through VNC remote desktop control.'
      }
    ];
    
    for (let i = 0; i < sampleInteractions.length; i++) {
      const msg = sampleInteractions[i];
      history.push({
        id: `msg_${i + 1}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(timestamp.getTime() + (i + 1) * 1000),
        metadata: { agent_type: 'demo' }
      });
    }
    
    return history;
  }
  
  static async runConnectionTest(config: VNCConfig): Promise<boolean> {
    console.log(`Testing VNC connection to ${config.host}:${config.port}...`);
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate different connection scenarios
    const scenarios = {
      'localhost': true,  // Local connection usually works
      '127.0.0.1': true,  // localhost alternative
      '192.168.1.1': false,  // Simulate unreachable host
      'nonexistent': false  // Simulate invalid host
    };
    
    const canConnect = scenarios[config.host] ?? false;
    
    if (canConnect) {
      console.log('✅ VNC connection test successful');
    } else {
      console.log('❌ VNC connection test failed');
      console.log('   Make sure VNC server is running on the specified host and port');
    }
    
    return canConnect;
  }
}

// Export configuration validator
export function validateVNCConfig(config: Partial<VNCConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.host || typeof config.host !== 'string') {
    errors.push('VNC host is required and must be a string');
  }
  
  if (!config.port || typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
    errors.push('VNC port is required and must be a number between 1 and 65535');
  }
  
  if (config.width && (typeof config.width !== 'number' || config.width < 100)) {
    errors.push('Screen width must be a number greater than 100');
  }
  
  if (config.height && (typeof config.height !== 'number' || config.height < 100)) {
    errors.push('Screen height must be a number greater than 100');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}