# AGENTS.md

## Overview

Sigle is a decentralized Web3 blogging platform built as a pnpm monorepo with Next.js 16, Nitro/Fastify, and Stacks blockchain integration. The repository uses Turbo for task orchestration and requires Node.js 24+ with pnpm 10.

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
│   └── contracts-source-next/
│   └── testnet-seed/
└── docker-compose.yaml - Local dev services (PostgreSQL)
```

## Key Commands

These commands should be run from the monorepo root.

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# check (format, lint, typecheck)
pnpm vp check

# Run all tests
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

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
