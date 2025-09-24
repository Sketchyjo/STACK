#!/bin/bash

# STACK Development Setup Script

set -e

echo "🚀 Starting STACK development environment..."

# Check if required tools are installed
check_dependencies() {
    echo "📋 Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        echo "❌ pnpm is not installed. Please install pnpm"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker"
        exit 1
    fi
    
    echo "✅ All dependencies are installed"
}

# Install packages
install_packages() {
    echo "📦 Installing packages..."
    pnpm install
}

# Setup environment
setup_env() {
    echo "⚙️  Setting up environment..."
    
    if [ ! -f .env ]; then
        echo "📝 Creating .env file from .env.example..."
        cp .env.example .env
        echo "✨ Please update .env with your actual configuration"
    fi
}

# Start services with Docker
start_services() {
    echo "🐳 Starting Docker services..."
    docker-compose up -d postgres redis
    
    echo "⏳ Waiting for services to be ready..."
    sleep 10
}

# Generate Prisma client and run migrations
setup_database() {
    echo "🗄️  Setting up database..."
    pnpm --filter @stack/database db:generate
    pnpm --filter @stack/database db:push
    echo "✅ Database setup complete"
}

# Build packages
build_packages() {
    echo "🔨 Building packages..."
    pnpm build
    echo "✅ Build complete"
}

# Start development servers
start_dev() {
    echo "🏃 Starting development servers..."
    echo "🌐 API will be available at: http://localhost:3001"
    echo "📱 Mobile app will be available via Expo CLI"
    echo "🔄 Starting all services..."
    
    pnpm dev
}

# Main execution
main() {
    check_dependencies
    install_packages
    setup_env
    start_services
    setup_database
    build_packages
    start_dev
}

# Handle cleanup on script exit
cleanup() {
    echo "🧹 Cleaning up..."
    docker-compose down
}

trap cleanup EXIT

# Run main function
main "$@"