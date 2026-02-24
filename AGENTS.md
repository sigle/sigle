# AGENTS.md

## Overview

Sigle is a decentralized Web3 blogging platform built as a pnpm monorepo with Next.js 16, Nitro/Fastify, and Stacks blockchain integration. The repository uses Turbo for task orchestration and requires Node.js 22+ with pnpm 10.

## Architecture

```
sigle/
├── apps/
│   ├── sigle/          - Next.js frontend (port 3000)
│   ├── custom-domain/  - Custom domain routing (port 3002)
│   ├── server/         - Nitro API backend (port 3001)
│   ├── docs/           - Nextra documentation
│   └── contracts/      - Clarity smart contracts
├── packages/
│   ├── sdk/            - Shared TypeScript SDK
│   ├── contracts-source/
│   └── testnet-seed/
└── docker-compose.yaml - Local dev services (PostgreSQL)
```

## Key Commands

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# check-types
pnpm check-types

# Format code
pnpm format:fix

# Lint everything
pnpm lint:fix

# Run all tests via Turbo
pnpm test
```

### Single Test Execution

```bash
# Run single test file
cd apps/contracts && pnpm test -- test-file.spec.ts
cd packages/sdk && pnpm test -- test-file.spec.ts
```

### Docker Development

```bash
# Start all services with hot reload
docker compose up --build --watch

# Reset database
docker exec $(docker container ls -q -f "name=sigle-server") pnpm prisma migrate reset
```

## Code Style Guidelines

### TypeScript Conventions

- Use explicit types for function parameters and return values where it aids readability
- Avoid `any` - use `unknown` with type guards instead
- Use TypeScript inference for obvious types
- Prefer interfaces for object shapes, types for unions/primitives
- No explicit module boundary types required

### Naming Conventions

- **Files**: kebab-case for components (`my-component.tsx`), camelCase for utilities (`myUtility.ts`)
- **Components**: PascalCase (`UserProfile.tsx`)
- **Variables/Functions**: camelCase (`userName`, `getPosts`)
- **Constants**: UPPER_SNAKE_CASE for config values, camelCase for others
- **Classes/Interfaces**: PascalCase
- **Booleans**: Prefix with `is`, `has`, `can` (`isLoading`, `hasAccess`)

## PR Requirements

1. Fork repository and branch from `main`
2. Include changeset: run `pnpm changeset` to generate
3. Pass format: `pnpm format:fix`
4. Pass lint: `pnpm lint`
5. Don't break tests - include tests for bug fixes
6. Keep PRs isolated and focused

## Git Hooks

Pre-commit hooks run `oxfmt` on staged files via lefthook. Ensure commits are formatted.
