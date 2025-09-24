# Contributing to STACK

Thank you for your interest in contributing to STACK! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## 🤝 Code of Conduct

We are committed to fostering a welcoming and inclusive environment. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose
- Expo CLI (for mobile development)

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/stack-monorepo.git
   cd stack-monorepo
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Setup environment:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```
5. Start development services:
   ```bash
   ./scripts/dev.sh
   ```

## 🔄 Development Process

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(mobile): add investment portfolio screen
fix(api): resolve authentication middleware issue
docs: update deployment instructions
```

## 📏 Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefer explicit return types for functions
- Use meaningful variable and function names
- Document complex business logic

### Code Style

- Use Prettier for code formatting
- Follow ESLint rules
- Use meaningful commit messages
- Write self-documenting code

### File Organization

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

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @stack/api test
pnpm --filter @stack/mobile test

# Run tests in watch mode
pnpm --filter @stack/api test:watch
```

### Test Guidelines

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Aim for meaningful test coverage
- Use descriptive test names

### Test Structure

```javascript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com' };
      
      // Act
      const result = await UserService.createUser(userData);
      
      // Assert
      expect(result.email).toBe('test@example.com');
    });
  });
});
```

## 📝 Pull Request Process

### Before Submitting

1. Ensure all tests pass: `pnpm test`
2. Lint your code: `pnpm lint`
3. Format your code: `pnpm format`
4. Build the project: `pnpm build`
5. Update documentation if needed

### PR Checklist

- [ ] Code follows project coding standards
- [ ] Tests are added/updated for changes
- [ ] Documentation is updated if needed
- [ ] All CI checks pass
- [ ] Self-review completed
- [ ] Ready for code review

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated
```

## 📁 Project Structure

### Apps

- **mobile/**: Expo React Native application
- **api/**: Fastify backend API
- **web/**: Future web application

### Packages

- **ui/**: Shared UI component library
- **shared-types/**: TypeScript type definitions
- **database/**: Prisma database schema and client
- **eslint-config/**: ESLint configuration
- **typescript-config/**: TypeScript configuration

### Adding New Packages

1. Create package directory in `packages/`
2. Add `package.json` with proper naming (`@stack/package-name`)
3. Update root `package.json` workspaces if needed
4. Add build scripts to `turbo.json`
5. Update documentation

## 🛠 Development Tools

### Turborepo

We use Turborepo for:
- Monorepo management
- Build caching
- Task orchestration
- Dependency management

### Package Scripts

Each package should include these scripts:
- `build`: Build the package
- `dev`: Development mode
- `lint`: Lint the code
- `test`: Run tests
- `clean`: Clean build artifacts

## 🚀 Deployment

### Environment Setup

- Development: Local Docker setup
- Staging: Docker Compose with staging config
- Production: Kubernetes or Docker Swarm

### Release Process

1. Create release branch from `main`
2. Update version numbers
3. Update CHANGELOG.md
4. Create and merge PR
5. Tag release
6. Deploy to staging
7. Deploy to production

## 📞 Getting Help

- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our development Discord
- **Email**: Contact maintainers directly

## 🎯 What We're Looking For

### High Priority

- Bug fixes
- Performance improvements
- Test coverage improvements
- Documentation improvements

### Medium Priority

- New features (with discussion first)
- UI/UX improvements
- Developer experience improvements

### Please Avoid

- Large refactors without discussion
- Breaking changes without major version bump
- Code style only changes (unless fixing eslint issues)

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

Thank you for contributing to STACK! 🚀