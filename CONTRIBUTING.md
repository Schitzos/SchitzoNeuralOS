# Contributing to Schitzo NeuralOS

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (for PostgreSQL & Redis)
- PM2 (`npm install -g pm2`)
- Git

## Local Setup

```bash
# 1. Clone
git clone https://github.com/Schitzos/SchitzoNeuralOS.git
cd SchitzoNeuralOS

# 2. Install dependencies
npm install

# 3. Start PostgreSQL & Redis
docker-compose up -d

# 4. Configure environment
cp .env.example .env
# Edit .env with your actual credentials

# 5. Generate Prisma client & run migrations
npm run db:generate
npm run db:migrate

# 6. Start development
npm run dev:core     # NestJS API on http://127.0.0.1:3000
npm run dev:console  # Next.js dashboard on http://localhost:3001
```

## Production (PM2)

```bash
npm run build
pm2 start ecosystem.config.js
pm2 status
```

## Git Strategy

```
feature/<ticket-number>-<short-slug> → develop → main
```

### Branch Rules

- Always branch from `develop`
- One feature branch per ticket
- Merge to `develop` after QA passes
- Merge to `main` requires release approval

### Commit Format

```
feat(task-123): implement retry policy
fix(task-456): resolve jest runtime failure
refactor(task-789): simplify workflow execution
```

## Testing

```bash
npm test              # Run all tests
npm test -w apps/core # Run core tests only
```

- 100% test pass rate mandatory
- 90% code coverage target

## Linting

```bash
npm run lint    # ESLint
npm run format  # Prettier
```

## Project Structure

```
apps/core/          — NestJS backend (Schitzo Core)
apps/console/       — Next.js dashboard (Neural Console)
packages/shared/    — Shared utilities
packages/types/     — Shared TypeScript types
```

## Environment Variables

See `.env.example` for all required variables. Never commit `.env` files.
