# AGENTS.md

## Overview

Sigle is a decentralized Web3 blogging platform built as a pnpm monorepo with Next.js 16, Nitro/Fastify, and Stacks blockchain integration. The repository uses Turbo for task orchestration and requires Node.js 26+ with pnpm 12.

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

# Sync vendored reference repositories (e.g., Effect)
pnpm repos:sync
```

### Single Test Execution

```bash
# Run single test file
cd apps/contracts && pnpm test -- test-file.spec.ts
cd packages/sdk && pnpm test -- test-file.spec.ts
```

### Docker Development

```bash
# Start backend & database with hot reload
pnpm docker:dev

# Start full stack (server + sigle + custom-domain)
pnpm docker:dev:full

# Reset database (one-off server container)
pnpm db:reset

# Create Prisma migration (one-off server container)
pnpm db:migrate --name <migration-name>

# Open Prisma Studio GUI
pnpm db:studio
```

## Vendored Repositories

This project vendors external repositories under `repos/` (gitignored):

- If `repos/effect` is missing or empty, run `pnpm repos:sync` to clone/update the vendored repositories
- Use vendored repositories as read-only reference material when working with related libraries
- Prefer examples and patterns from the vendored source code over generated guesses or web search results
- Do not edit files under `repos/` unless explicitly asked
- Do not import from `repos/` - application code should continue importing from normal package dependencies
- When writing Effect code, inspect `repos/effect/` for examples of idiomatic usage, tests, module structure, and API design. Treat it as the source of truth for Effect patterns.

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

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
