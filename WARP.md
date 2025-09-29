# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

STACK is a decentralized investment platform built as a Turborepo monorepo containing:
- **Mobile App**: Expo React Native application (apps/mobile)
- **API Service**: Fastify backend with PostgreSQL and Redis (apps/api)
- **Shared Packages**: Reusable components, types, and configurations (packages/)

## Essential Development Commands

### Initial Setup
```bash
# Complete setup (recommended for first time)
./scripts/dev.sh

# Manual setup (alternative)
pnpm install
cp .env.example .env
docker-compose up -d postgres redis
pnpm --filter @stack/database db:generate
pnpm --filter @stack/database db:push
pnpm build
```

### Development Workflow
```bash
# Start all services in development mode
pnpm dev

# Start individual services
pnpm --filter @stack/mobile dev      # Mobile app with Expo
pnpm --filter @stack/api dev         # Fastify API server
pnpm --filter @stack/ui dev          # UI library

# Database operations
pnpm --filter @stack/database db:generate    # Generate Prisma client
pnpm --filter @stack/database db:push        # Push schema changes
pnpm --filter @stack/database db:migrate     # Run migrations
pnpm --filter @stack/database db:studio      # Open Prisma Studio
pnpm --filter @stack/database db:seed        # Seed database
```

### Mobile App Specific Commands
```bash
# Inside apps/mobile
pnpm start                    # Start Expo dev server
pnpm ios                      # Run on iOS simulator
pnpm android                  # Run on Android emulator
pnpm web                      # Run on web

# EAS builds
pnpm build:dev               # Development build
pnpm build:preview          # Preview build
pnpm build:prod             # Production build
```

### Testing and Quality
```bash
# Run tests
pnpm test                           # All packages
pnpm --filter @stack/api test       # API only
pnpm --filter @stack/api test:watch # API in watch mode

# Code quality
pnpm lint                    # Lint all packages
pnpm format                  # Format all code
pnpm check-types            # TypeScript type checking
pnpm build                  # Build all packages
```

### Docker Operations
```bash
# Development environment
docker-compose up -d                          # Start services
docker-compose logs -f                        # View logs
docker-compose down                           # Stop services

# Production environment
docker-compose -f docker-compose.prod.yml up -d
```

## Architecture Overview

### Monorepo Structure
- **Turborepo**: Build system with caching and task orchestration
- **pnpm**: Package manager with workspace support
- **Apps**: Main applications (mobile, api, web)
- **Packages**: Shared libraries and configurations

### Mobile App (Expo + React Native)
- **Framework**: Expo SDK 53 with development client
- **Navigation**: Expo Router with file-based routing
- **Styling**: NativeWind (Tailwind for React Native)
- **Fonts**: SF Pro Rounded family loaded at app level
- **State Management**: Zustand for global state
- **Architecture Pattern**: 
  - `app/` - File-based routing with Expo Router
  - `src/screens/` - Screen components
  - `src/components/` - Reusable components
  - `src/config/` - Configuration files (tabs, etc.)
  - `components/` - Legacy/shared components
  - `store/` - Zustand store definitions

### Tab Navigation System
The app uses a custom tab bar system with:
- Configuration driven tabs in `src/config/tabs.ts`
- Custom TabBar component with Iconoir icons
- Featured tab support with special styling
- Type-safe navigation with TypeScript

### API Service (Fastify + Prisma)
- **Framework**: Fastify with TypeScript
- **Database**: Prisma ORM with PostgreSQL
- **Validation**: Zod schemas
- **Security**: CORS, Helmet, Rate limiting

### Shared Packages
- `@stack/ui` - UI component library
- `@stack/shared-types` - TypeScript type definitions
- `@stack/database` - Prisma schema and client
- `@stack/config` - Shared configurations
- `@stack/eslint-config` - ESLint rules
- `@stack/typescript-config` - TypeScript configurations

## Development Best Practices

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Follow Conventional Commits:
- `feat(mobile): add investment portfolio screen`
- `fix(api): resolve authentication middleware issue`
- `docs: update deployment instructions`

### Code Organization
```
src/
├── components/          # Reusable components
├── screens/            # Screen components (mobile)
├── services/           # API services
├── utils/              # Utility functions
├── types/              # Local type definitions
├── constants/          # App constants
└── hooks/              # Custom hooks
```

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- Use descriptive test names and AAA pattern (Arrange, Act, Assert)

### Mobile Development Guidelines
- The app uses Expo development client (not Expo Go)
- NativeWind is configured for Tailwind CSS styling
- Custom fonts (SF Pro Rounded) are preloaded
- TypeScript strict mode is enabled
- File-based routing with Expo Router

### Package Management
- Use `pnpm --filter <package>` to run commands on specific packages
- All packages use `@stack/` namespace
- Shared dependencies are managed at the workspace root
- Local packages are referenced with `workspace:*`

## Key Configuration Files
- `turbo.json` - Turborepo task configuration
- `pnpm-workspace.yaml` - pnpm workspace configuration
- `apps/mobile/app.json` - Expo configuration
- `apps/mobile/eas.json` - EAS build configuration
- `apps/mobile/tailwind.config.js` - Tailwind configuration with shared packages
- `apps/mobile/metro.config.js` - Metro bundler with NativeWind