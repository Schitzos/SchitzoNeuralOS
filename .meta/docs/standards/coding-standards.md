# Coding Standards

## Architecture

### Backend — Clean Architecture (NestJS)

```text
┌─────────────────────────────────────────────┐
│  Presentation (Controllers, DTOs, Guards)   │  ← Outer
├─────────────────────────────────────────────┤
│  Application (Services / Use Cases, Ports)  │
├─────────────────────────────────────────────┤
│  Domain (Entities, Value Objects, Enums)    │  ← Inner
├─────────────────────────────────────────────┤
│  Infrastructure (Repositories, Adapters)    │  ← Outer
└─────────────────────────────────────────────┘
```

**Dependency Rule:** Inner layers never import from outer layers. Dependencies point inward.

- **Domain** — Pure business logic. No framework imports. No I/O.
- **Application** — Use cases orchestrating domain logic. Defines ports (interfaces) for infrastructure.
- **Infrastructure** — Implements ports. Prisma repositories, HTTP adapters, queue producers.
- **Presentation** — Controllers, DTOs, guards. Translates HTTP to application calls.

### Frontend — Component-Based Next.js (App Router)

- Server Components by default. Client Components only for interactivity.
- Pages are thin — delegate logic to components and hooks.
- Shared UI in `components/`, page-specific in `app/<route>/components/`.

---

## Module Structure (NestJS)

Each domain gets its own module:

```text
src/
  tasks/
    tasks.module.ts
    tasks.controller.ts
    tasks.service.ts
    tasks.repository.ts
    dto/
      create-task.dto.ts
      update-task.dto.ts
    entities/
      task.entity.ts
    tasks.service.spec.ts
    tasks.controller.spec.ts
```

### Rules

- One module per bounded context (tasks, telegram, queue, nine-router, etc.)
- One service per use case (prefer focused services over god services)
- Repository wraps Prisma — services never call Prisma directly
- DTOs live in `dto/` folder, validated with `class-validator`
- Entities are domain objects (may differ from Prisma models)

---

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `task.service.ts` |
| Classes | PascalCase | `TaskService` |
| Methods | camelCase | `createTask()` |
| Interfaces | PascalCase, prefixed `I` only for ports | `ITaskRepository` |
| DTOs | PascalCase + Dto suffix | `CreateTaskDto` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |

---

## Import Ordering

```typescript
// 1. External packages
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 2. Internal packages (monorepo)
import { TaskStatus } from '@schitzo/types';
import { generateId } from '@schitzo/shared';

// 3. Relative imports
import { TaskRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
```

---

## DTO Validation

Use `class-validator` + `class-transformer`:

```typescript
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TaskType } from '@schitzo/types';

export class CreateTaskDto {
  @IsString()
  userPrompt: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsEnum(TaskType)
  taskType?: TaskType;
}
```

Enable globally in `main.ts`:

```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

---

## Repository Pattern

```typescript
// tasks.repository.ts
@Injectable()
export class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTaskData): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  async findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async findMany(params: FindTasksParams): Promise<{ data: Task[]; total: number }> {
    const [data, total] = await Promise.all([
      this.prisma.task.findMany({ skip: params.offset, take: params.limit }),
      this.prisma.task.count(),
    ]);
    return { data, total };
  }
}
```

Services inject repositories, never PrismaService directly.

---

## Next.js Structure (Neural Console)

```text
apps/console/src/
  app/
    layout.tsx
    page.tsx
    tasks/
      page.tsx
      [id]/
        page.tsx
      components/
        task-list.tsx
        task-card.tsx
    pipeline/
      page.tsx
      components/
        pipeline-view.tsx
        pipeline-node.tsx
  components/
    ui/
      button.tsx
      badge.tsx
      drawer.tsx
    layout/
      sidebar.tsx
      header.tsx
  hooks/
    use-tasks.ts
    use-websocket.ts
  lib/
    api.ts
    utils.ts
```

### Rules

- `app/` — Routes only. Thin pages that compose components.
- `components/ui/` — Reusable design system components.
- `components/layout/` — Shell components (sidebar, header).
- `hooks/` — Custom React hooks for data fetching and state.
- `lib/` — Utilities, API client, helpers.
- Server Components by default. Add `'use client'` only when needed.

---

## Shared Packages

- `packages/types` — TypeScript interfaces, enums, type unions. No runtime code.
- `packages/shared` — Utility functions (ID generation, date formatting). No framework dependencies.

Import as:
```typescript
import { TaskStatus } from '@schitzo/types';
import { generateId } from '@schitzo/shared';
```

---

## General Rules

- No `any` type. Use `unknown` and narrow.
- No default exports (except Next.js pages).
- Prefer `const` over `let`. Never `var`.
- Async/await over raw promises.
- Early returns over nested conditionals.
- Maximum function length: ~30 lines. Extract if longer.
- Comments explain WHY, not WHAT.
