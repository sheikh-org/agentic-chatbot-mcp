#!/bin/bash

# Agentic Chatbot VNC Setup Script
# This script helps set up the project quickly

set -e

echo "🚀 Setting up Agentic Chatbot with VNC..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) found"
}

# Install dependencies
install_dependencies() {
    print_status "Installing npm dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Setup environment file
setup_environment() {
    if [ ! -f ".env.local" ]; then
        print_status "Creating environment configuration..."
        cp .env.local.example .env.local
        print_success "Environment file created (.env.local)"
        print_warning "Please update .env.local with your Google API key"
        echo ""
        echo -e "${YELLOW}To get your Google API key:${NC}"
        echo "1. Visit: https://makersuite.google.com/app/apikey"
        echo "2. Create a new API key"
        echo "3. Copy it to .env.local file"
        echo ""
    else
        print_warning ".env.local already exists"
    fi
}

# Install AI SDK dependencies
install_ai_sdk() {
    print_status "Installing AI SDK dependencies..."
    npm install @ai-sdk/google ai
    print_success "AI SDK dependencies installed"
}

# Check for VNC server
check_vnc() {
    print_status "Checking for VNC server..."
    
    # Check common VNC ports
    PORTS=(5900 5901 5902)
    VNC_FOUND=false
    
    for port in "${PORTS[@]}"; do
        if nc -z localhost "$port" 2>/dev/null; then
            print_success "VNC server found on port $port"
            VNC_FOUND=true
            break
        fi
    done
    
    if [ "$VNC_FOUND" = false ]; then
        print_warning "No VNC server detected on common ports"
        echo ""
        echo -e "${YELLOW}To set up VNC server:${NC}"
        echo "Linux: sudo apt install tigervnc-standalone-server"
        echo "macOS: Install RealVNC or TigerVNC"
        echo "Windows: Install RealVNC Server"
        echo ""
        echo -e "${BLUE}VNC will still work for the chat interface,${NC}"
        echo -e "${BLUE}but screen interaction features will be disabled${NC}"
    fi
}

# Verify setup
verify_setup() {
    print_status "Verifying setup..."
    
    # Check if essential files exist
    REQUIRED_FILES=("package.json" "next.config.js" "tailwind.config.js" "src/app/page.tsx")
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    print_success "Setup verification passed"
}

# Main setup process
main() {
    echo "================================================"
    echo "    Agentic Chatbot VNC - Setup Wizard"
    echo "================================================"
    echo ""
    
    check_node
    install_dependencies
    install_ai_sdk
    setup_environment
    check_vnc
    verify_setup
    
    echo ""
    print_success "Setup completed successfully! 🎉"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Update .env.local with your Google API key"
    echo "2. Run: npm run dev"
    echo "3. Open: http://localhost:3000"
    echo ""
    echo -e "${BLUE}Available commands:${NC}"
    echo "  npm run dev          - Start development server"
    echo "  npm run dev:next     - Start Next.js only"
    echo "  npm run build        - Build for production"
    echo "  npm run type-check   - Run TypeScript check"
    echo ""
    echo -e "${YELLOW}For VNC setup help, see README.md${NC}"
    echo ""
}

# Run main setup
main