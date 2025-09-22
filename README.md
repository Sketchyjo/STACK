# STACK - Decentralized Investment Platform

<div align="center">
  <h3>🚀 Professional Turborepo Monorepo for STACK Platform</h3>
  <p>A scalable, production-ready monorepo setup with Expo React Native, Fastify API, and shared packages</p>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)

## 🎯 Overview

STACK is a decentralized investment platform built with modern technologies and best practices. This monorepo contains:

- **Mobile App**: Expo React Native application for iOS and Android
- **API Service**: Fastify-based backend with PostgreSQL and Redis
- **Shared Packages**: Reusable components, types, and configurations
- **Docker Setup**: Containerized development and production environments
- **CI/CD Ready**: Configured for modern deployment workflows

## 🏗️ Architecture

```
STACK Monorepo
├── Apps
│   ├── 📱 Mobile (Expo React Native)
│   ├── 🌐 API (Fastify + Prisma)
│   └── 🔮 Web (Future: Next.js)
├── Packages
│   ├── 🎨 UI Library (Shared Components)
│   ├── 📝 Shared Types (TypeScript)
│   ├── 🗄️  Database (Prisma)
│   └── ⚙️  Config (ESLint, TypeScript)
└── Infrastructure
    ├── 🐳 Docker
    ├── 🔄 Nginx
    └── 📊 Monitoring
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** & **Docker Compose**
- **Expo CLI** (for mobile development)

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd stack-monorepo

# Copy environment variables
cp .env.example .env

# Run the development setup script
./scripts/dev.sh
```

### 2. Manual Setup (Alternative)

```bash
# Install dependencies
pnpm install

# Start Docker services
docker-compose up -d postgres redis

# Generate database client
pnpm --filter @stack/database db:generate
pnpm --filter @stack/database db:push

# Build packages
pnpm build

# Start development
pnpm dev
```

## 📁 Project Structure

```
stack-monorepo/
├── apps/
│   ├── mobile/                 # Expo React Native app
│   │   ├── src/
│   │   ├── app.json
│   │   └── package.json
│   ├── api/                    # Fastify API service
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                    # Future web app
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── shared-types/           # TypeScript types
│   ├── database/               # Prisma database package
│   ├── config/                 # Shared configurations
│   ├── eslint-config/          # ESLint configurations
│   └── typescript-config/      # TypeScript configurations
├── scripts/
│   └── dev.sh                  # Development setup script
├── docker-compose.yml          # Development Docker setup
├── docker-compose.prod.yml     # Production Docker setup
├── nginx.conf                  # Nginx configuration
├── turbo.json                  # Turborepo configuration
└── package.json               # Root package.json
```

## 🛠 Development

### Starting Development Environment

```bash
# Start all services
pnpm dev

# Start individual services
pnpm --filter @stack/api dev        # API only
pnpm --filter @stack/mobile dev     # Mobile only
pnpm --filter @stack/ui dev          # UI package only
```

### Database Operations

```bash
# Generate Prisma client
pnpm --filter @stack/database db:generate

# Push schema to database
pnpm --filter @stack/database db:push

# Run migrations
pnpm --filter @stack/database db:migrate

# Open Prisma Studio
pnpm --filter @stack/database db:studio

# Seed database
pnpm --filter @stack/database db:seed
```

### Mobile Development

```bash
# Start Expo development server
pnpm --filter @stack/mobile dev

# Run on iOS simulator
pnpm --filter @stack/mobile ios

# Run on Android emulator
pnpm --filter @stack/mobile android

# Build development build
pnpm --filter @stack/mobile build:dev
```

## 🐳 Deployment

### Development Deployment

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# Scale API service
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

## 📜 Available Scripts

### Root Level Scripts

```bash
pnpm dev              # Start development mode
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm format           # Format code
pnpm test             # Run tests
pnpm clean            # Clean all build outputs
pnpm setup            # Install and build everything
```

### Docker Scripts

```bash
pnpm docker:build     # Build Docker images
pnpm docker:up        # Start Docker services
pnpm docker:down      # Stop Docker services
```

## 🏗️ Development Workflow

1. **Setup**: Run `./scripts/dev.sh` or follow manual setup
2. **Development**: Use `pnpm dev` to start all services
3. **Testing**: Run `pnpm test` for all tests
4. **Linting**: Run `pnpm lint` and `pnpm format`
5. **Building**: Run `pnpm build` before deployment
6. **Deployment**: Use Docker Compose for containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and ensure tests pass
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ using Turborepo, Expo, Fastify, and Docker</p>
  <p>Made for modern, scalable applications</p>
</div># STACK-APP
# STACK
