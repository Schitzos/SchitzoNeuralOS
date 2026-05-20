# Schitzo NeuralOS

Multi-Agent AI Operating System for project-aware software development automation.

## Architecture

```
Telegram / Neural Console → Schitzo Core (NestJS) → LangGraph JS → Hermes → 9Router → Models
```

## Stack

- **Schitzo Core** — NestJS + TypeScript + Prisma + PostgreSQL
- **Neural Console** — Next.js + Tailwind + React Flow
- **Workflow** — LangGraph JS
- **Agent Runtime** — Hermes
- **Model Gateway** — 9Router
- **Interface** — Telegram (Schitzo Link)
- **Queue** — BullMQ + Redis
- **Process Manager** — PM2

## Monorepo Structure

```
apps/core          — NestJS backend (Schitzo Core)
apps/console       — Next.js dashboard (Neural Console)
packages/shared    — Shared utilities
packages/types     — Shared TypeScript types
```

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev:core
npm run dev:console
```

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full setup instructions.

## License

Private — All rights reserved.
