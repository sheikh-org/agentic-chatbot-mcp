# Agentic Chatbot with MCP Integration

A fully functional agentic chatbot powered by Google Generative AI with Chrome DevTools MCP integration for intelligent browser automation and VNC remote desktop control. This application demonstrates the integration of AI decision-making with browser automation and remote system interaction.

![Agentic Chatbot with MCP](https://img.shields.io/badge/Status-Beta-orange)
![AI Provider](https://img.shields.io/badge/AI%20Provider-Google%20Generative%20AI-blue)
![MCP](https://img.shields.io/badge/MCP-Chrome%20DevTools-green)
![VNC](https://img.shields.io/badge/VNC-Real--time%20Streaming-blue)

## 🌟 Features

### 🤖 AI-Powered Agent
- **Intelligent Decision Making**: Uses Google Generative AI (Gemini Pro) for contextual responses
- **Tool Execution**: Automatically determines when to use tools based on user intent
- **Natural Language Control**: Understand and execute browser automation commands
- **Multi-Modal Interaction**: Combines conversation, browser automation, and remote system control

### 🌐 Chrome DevTools MCP Integration
- **Browser Automation**: Navigate, click, type, and extract data from web pages
- **Intelligent Task Planning**: AI creates automation tasks from natural language requests
- **Session Management**: Persistent browser sessions with task execution history
- **Real-time Control**: Immediate browser actions based on AI decisions
- **Comprehensive API**: RESTful APIs for full browser automation control

### 🖥️ VNC Remote Desktop
- **Real-time Screen Streaming**: Live remote desktop viewing through web browser
- **Interactive Control**: Full mouse and keyboard input forwarding
- **WebSocket Communication**: Efficient real-time data transfer
- **Connection Management**: Automatic reconnection and error handling

### 💬 Chat Interface
- **Real-time Messaging**: Instant AI responses with streaming support
- **Message History**: Persistent conversation context
- **Agent Status**: Live status indicators showing connection states
- **Rich UI Components**: Modern React interface with Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │◄──►│   Next.js App    │◄──►│  WebSocket Srv  │    │   MCP Server    │
│  (React/Tailwind│    │   (Node.js)      │    │   (Port 3001)   │    │  (Port 3002)    │
│   Components)   │    │                  │    │                 │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │              ┌──────────────────┐              │              ┌──────────────────┐
         └─────────────►│  Agentic Chatbot │◄─────────────┘              │  Chrome DevTools │
                        │   (AI Engine)    │                             │  (Browser Ctrl)  │
                        │                  │                             │                  │
                        │  • AI Provider   │                             │  • Navigation    │
                        │  • Tool Manager  │                             │  • Interaction   │
                        │  • VNC Client    │                             │  • Extraction    │
                        │  • Browser Agent │                             │  • Automation    │
                        └──────────────────┘                             └──────────────────┘
                                 │                                               │
                        ┌──────────────────┐                                     │
                        │   VNC Server     │                                     │
                        │   (Remote)       │                                     │
                        │                  │                                     │
                        │  • Screen Share  │                                     │
                        │  • Input Control │                                     │
                        │  • Authentication│                                     │
                        └──────────────────┘                                     │
                                                                                   │
                        ┌──────────────────────────────────────────────────────────┘
                        │                    Chrome Browser
                        │                   (via DevTools)
                        │
                        │  • DOM Manipulation
                        │  • Page Navigation  
                        │  • Form Interaction
                        │  • Data Extraction
```

### Core Components

#### 1. **AgentBrowserIntegration** (`src/utils/agent-browser.ts`)
- Orchestrates AI decision-making and browser automation
- Analyzes natural language requests and creates automation tasks
- Manages conversation history and browser context
- Provides intelligent task planning and execution

#### 2. **BrowserAutomationService** (`src/utils/browser-automation.ts`)
- Manages browser automation tasks and execution
- Handles Chrome DevTools MCP server communication
- Provides task creation, execution, and result tracking
- Manages browser sessions and tool availability

#### 3. **ChromeDevToolsMCPIntegration** (`src/utils/mcp-integration.ts`)
- Low-level MCP server management and lifecycle control
- Protocol communication with Chrome DevTools
- Server startup, monitoring, and graceful shutdown
- Command execution and response handling

#### 4. **AgenticChatbot** (`src/utils/agentic-chatbot.ts`)
- Orchestrates AI decision-making and tool execution
- Manages conversation history and context
- Handles VNC connection and screen interactions
- Provides extensible tool system

#### 5. **GoogleGenerativeAIProvider** (`src/utils/ai-provider.ts`)
- Integration with Google Gemini Pro
- Decision-making and response generation
- Screen content analysis (VNC integration)
- Context-aware conversation management

#### 6. **VNCClient** (`src/utils/vnc-client.ts`)
- Browser-based VNC connection management
- Mouse and keyboard event forwarding
- Screen update processing
- WebSocket communication

#### 7. **VNCWebSocketServer** (`src/utils/vnc-websocket-server.ts`)
- Server-side WebSocket proxy for VNC traffic
- Connection management and authentication
- Event routing between client and VNC server

## 🚀 Quick Start

### Prerequisites

- **Node.js 20.19.0+** (automatically managed via NVM)
- **Chrome/Chromium** browser installed
- **Google API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **VNC Server** (optional, for remote desktop features)

### Node.js Installation

The project includes automatic Node.js version management:

```bash
# Install NVM (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM and install Node.js 20
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install 20

# Verify installation
node --version  # Should show v20.19.0 or higher
```

### Installation

1. **Clone and setup the project:**
```bash
git clone <repository-url>
cd agentic-chatbot-mcp-repo
npm install
```

2. **Configure environment variables:**
```bash
# Create environment file
cp .env.local.example .env.local

# Edit .env.local with your API key
GOOGLE_API_KEY=your_google_api_key_here
VNC_HOST=localhost
VNC_PORT=5900
VNC_PASSWORD=
NEXT_PUBLIC_VNC_ENABLED=true
```

3. **Set up MCP configuration:**
```bash
npm run setup:mcp
```

4. **Start the development server (recommended):**
```bash
npm run dev:all
```

This starts:
- Next.js application on `http://localhost:3000`
- VNC WebSocket server on `ws://localhost:3001`
- Chrome DevTools MCP server on `ws://localhost:3002`

### Alternative Startup Methods

```bash
# Individual services
npm run dev:next    # Next.js only
npm run dev:ws      # VNC WebSocket server only
npm run dev:mcp     # MCP server only

# Production
npm run build
npm run start
```

### Access the Application

1. Open `http://localhost:3000` in your browser
2. Enter your Google API key
3. Configure VNC settings (if connecting to remote desktop)
4. Start chatting with your agentic assistant!

## 💡 Usage Examples

### Basic Conversation
```
User: "Hello, what can you help me with?"
Agent: "Hello! I'm your agentic assistant with browser automation and VNC capabilities. I can help you with web browsing tasks, automate browser interactions, analyze screens, and interact with applications. What would you like to work on?"
```

### Browser Automation via Natural Language
```
User: "Navigate to google.com and search for artificial intelligence"
Agent: "I'll help you navigate to Google and perform that search."
[Agent uses MCP to open Chrome, navigate to Google, type search query]
Agent: "I've navigated to Google and searched for 'artificial intelligence'. The search results are now displayed in the browser."
```

### Intelligent Web Interaction
```
User: "Go to a news website and click on the main headline"
Agent: "I'll navigate to a news website and identify the main headline for you."
[Agent navigates, analyzes page structure, clicks primary headline]
Agent: "I found and clicked on the main headline: 'AI Breakthrough in Quantum Computing'. The article is now open."
```

### Data Extraction
```
User: "Go to a weather website and tell me the current temperature in New York"
Agent: "I'll navigate to a weather site and extract the current temperature data for New York."
[Agent navigates to weather site, extracts temperature information]
Agent: "I found the current temperature in New York is 72°F (22°C) with partly cloudy conditions."
```

### Form Automation
```
User: "Help me fill out a contact form on a website"
Agent: "I can help you fill out forms! Please provide the website URL or describe the form you need help with. I can analyze the form fields and guide you through filling them out efficiently."
```

### Screen Analysis (VNC Integration)
```
User: "Can you see what's on my screen?"
Agent: "I'll check the current screen content for you..."
[Agent uses VNC to capture screen]
Agent: "I can see your desktop with several applications open including a web browser with multiple tabs. Would you like me to help you interact with any specific application?"
```

### Combined Browser + VNC Workflow
```
User: "Open a web browser on the remote desktop and navigate to my company's website"
Agent: "I'll connect to your VNC session, open the browser, and navigate to your company's website."
[Agent connects to VNC, opens browser, navigates to specified URL]
Agent: "I've successfully opened the browser in your VNC session and navigated to your company website. The site is now loaded and ready for interaction."
```

## 🔧 Configuration

### MCP Configuration

The project uses the official Chrome DevTools MCP server configuration in `mcp-config.json`:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    }
  }
}
```

### VNC Connection Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `VNC_HOST` | VNC server hostname or IP | `localhost` |
| `VNC_PORT` | VNC server port | `5900` |
| `VNC_PASSWORD` | VNC server password | `(empty)` |
| `width` | Screen width in pixels | `1024` |
| `height` | Screen height in pixels | `768` |
| `depth` | Color depth (bits) | `24` |

### AI Model Configuration

The application uses Google Gemini Pro with the following default settings:
- Temperature: 0.7
- Max Tokens: 1024
- Top P: 0.95
- Top K: 40

## 🔌 API Documentation

### Browser Agent API

**Endpoint**: `POST /api/browser-agent`

**Request Body**:
```json
{
  "userQuery": "Navigate to google.com and search for artificial intelligence",
  "currentUrl": "https://example.com",
  "pageContext": "Current page context"
}
```

**Response**:
```json
{
  "success": true,
  "task": {
    "id": "nav_1234567890_abc123",
    "type": "navigation",
    "description": "Navigate to https://www.google.com",
    "steps": [...]
  },
  "result": {
    "success": true,
    "timestamp": "2025-11-19T21:59:08.000Z",
    "stepsExecuted": 1,
    "stepsSuccessful": 1
  },
  "reasoning": "Task executed successfully in 1250ms",
  "nextSteps": ["Ready for interaction on the current page"]
}
```

### MCP Control API

**Endpoint**: `POST /api/mcp-control`

**Initialize Browser Automation**:
```json
{
  "action": "initialize",
  "options": {
    "headless": true,
    "viewport": "1920x1080",
    "channel": "stable"
  }
}
```

**Get Available Tools**:
```json
{
  "action": "get-tools"
}
```

**Status Check**:
```bash
GET /api/mcp-control
```

### Available Browser Tools

- `browser/navigate` - Navigate to URLs
- `browser/click` - Click on page elements
- `browser/type` - Type text into form fields
- `browser/screenshot` - Capture page screenshots
- `browser/getElements` - Query page elements
- `browser/evaluate` - Execute JavaScript
- `browser/console` - Access console logs
- `browser/network` - Monitor network requests
- `browser/dom` - Manipulate DOM elements
- `browser/performance` - Performance monitoring

## 🛠️ Development

### Project Structure

```
agentic-chatbot-mcp-repo/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/
│   │   │   ├── browser-agent/route.ts    # AI browser agent API
│   │   │   └── mcp-control/route.ts      # MCP control API
│   │   ├── page.tsx           # Main application page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ChatInterface.tsx  # Main chat UI
│   │   ├── VNCViewer.tsx      # VNC screen viewer
│   │   └── ui/               # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   │   └── useVNCWebSocket.ts # VNC WebSocket management
│   ├── utils/                # Utility functions
│   │   ├── agent-browser.ts              # AI browser integration
│   │   ├── browser-automation.ts         # Browser automation service
│   │   ├── mcp-integration.ts            # MCP server management
│   │   ├── agentic-chatbot.ts # Main chatbot logic
│   │   ├── ai-provider.ts    # Google AI integration
│   │   ├── vnc-client.ts     # VNC client implementation
│   │   └── vnc-websocket-server.ts # WebSocket proxy
│   └── types/                # TypeScript definitions
│       └── index.ts          # All type definitions
├── server.js                 # Development server
├── mcp-config.json           # MCP server configuration
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── next.config.js            # Next.js configuration
└── tsconfig.json             # TypeScript configuration
```

### Available Scripts

```bash
# Development with all services
npm run dev              # Next.js + VNC WebSocket + development server
npm run dev:all          # All services including MCP server

# Individual services
npm run dev:next         # Next.js only
npm run dev:ws           # VNC WebSocket server only
npm run dev:mcp          # Chrome DevTools MCP server only

# Setup and configuration
npm run setup:mcp        # Create MCP configuration file

# Production
npm run build            # Build Next.js application
npm run start            # Start production server
npm run deploy           # Build and start production

# Code quality
npm run type-check       # TypeScript type checking
npm run lint             # ESLint code linting
npm run clean            # Clean build artifacts
```

### Adding New Browser Automation Tools

Extend the agent's browser automation capabilities by adding new tools to the `BrowserStep` interface:

```typescript
const newAutomationStep: BrowserStep = {
  action: 'custom_action',
  target: 'element_selector',
  value: 'optional_value',
  description: 'Perform custom automation action',
  timeout: 5000,
  retry: 3
};
```

### Adding New AI Tools

Extend the agent's capabilities by adding new tools to the `AgentConfig`:

```typescript
const newTool: ToolConfig = {
  name: 'custom_action',
  description: 'Perform a custom action',
  parameters: { param1: 'string', param2: 'number' },
  handler: async (params) => {
    // Your custom logic here
    return `Action completed: ${params.param1}`;
  }
};
```

## 🔌 MCP Server Setup

### Chrome DevTools MCP Integration

The project uses the official Chrome DevTools MCP server for browser automation:

```bash
# Manual MCP server startup
npx chrome-devtools-mcp@latest --headless --viewport 1920x1080

# With custom Chrome channel
npx chrome-devtools-mcp@latest --channel beta

# With logging
npx chrome-devtools-mcp@latest --logFile /tmp/mcp-log.txt
```

### Available MCP Server Options

| Option | Description | Default |
|--------|-------------|---------|
| `--headless` | Run Chrome in headless mode | `false` |
| `--viewport` | Initial viewport size | `1280x720` |
| `--channel` | Chrome channel (stable/canary/beta/dev) | `stable` |
| `--logFile` | Debug log file path | `none` |
| `--acceptInsecureCerts` | Accept self-signed certificates | `false` |

## 🐛 Troubleshooting

### Node.js Version Issues

**Problem**: MCP server requires Node.js 20.19.0+ but you have an older version

**Solution**: 
```bash
# Install and use NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
```

### Chrome/Chromium Installation

**Problem**: Chrome not found for MCP server

**Solution**: 
```bash
# Check if Chrome is installed
which google-chrome || which chromium-browser

# Install Chrome (Ubuntu/Debian)
sudo apt update
sudo apt install google-chrome-stable

# Or install Chromium
sudo apt install chromium-browser
```

### API Key Issues

**Problem**: Google AI API requests failing

**Solution**:
```bash
# Verify API key is set
echo $GOOGLE_API_KEY

# Test API key validity
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"
```

### Port Conflicts

**Problem**: Services can't bind to required ports

**Solution**: Check what's using the ports:
```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
netstat -tulpn | grep :3002

# Change ports in configuration if needed
```

### MCP Server Won't Start

**Problem**: Chrome DevTools MCP server fails to start

**Solution**: 
```bash
# Enable debug logging
DEBUG=* npm run dev:mcp

# Check Chrome installation
google-chrome --version

# Try with different Chrome channel
npm run dev:mcp -- --channel beta
```

### VNC Connection Issues

**Problem**: VNC connection fails or disconnects

**Solution**: 
```bash
# Test VNC connection manually
vncviewer localhost:5900

# Check VNC server status
ps aux | grep vnc

# Restart VNC server
vncserver -kill :1
vncserver :1 -geometry 1920x1080 -depth 24
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Generative AI**: For the powerful Gemini Pro model
- **Chrome DevTools MCP**: For enabling browser automation through the Model Context Protocol
- **VNC Protocol**: For remote desktop access standards
- **Next.js Team**: For the excellent React framework
- **Tailwind CSS**: For utility-first CSS framework
- **NVM (Node Version Manager)**: For easy Node.js version management

## 📞 Support

For questions, issues, or contributions:

- Open an issue on GitHub
- Check the documentation in `/docs`
- Review the code examples in `/examples`

---

**Built with ❤️ by MiniMax Agent**

*This project demonstrates the integration of AI-powered decision making with browser automation and real-time system interaction, providing a foundation for building more sophisticated agentic applications with Chrome DevTools MCP integration.*

**Key Features:**
- 🤖 AI-powered natural language browser control
- 🌐 Chrome DevTools MCP for professional browser automation  
- 🖥️ VNC remote desktop streaming
- 🔌 Comprehensive API for all automation features
- 🛠️ Extensible architecture for custom tools and capabilities