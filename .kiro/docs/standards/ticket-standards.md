# Ticket Writing Standards

## Title Format

```text
PHASE-X.Y — <imperative verb> <what>
```

Examples:
- `PHASE-1.1 — Implement Telegram bot webhook integration`
- `PHASE-1.4 — Implement BullMQ job queue`

---

## Body Sections

### Description

What needs to be implemented. Include:
- Target files/modules
- Integration points
- Key technical decisions

### Target Files

```text
apps/core/src/telegram/telegram.module.ts
apps/core/src/telegram/telegram.service.ts
apps/core/src/telegram/telegram.controller.ts
```

### Acceptance Criteria

Binary testable items. Each must be verifiable with a yes/no answer.

✅ Good:
- `POST /telegram/webhook returns 200 for valid updates`
- `Unauthorized senders receive 403`

❌ Bad:
- `Works correctly`
- `Handles errors well`

### Testing Notes

Exact commands or steps to verify:
```text
1. npm run test -- --filter telegram
2. curl -X POST localhost:3001/telegram/webhook -d '...'
```

### Dependencies

```text
Depends on: PHASE-0.11 (auth baseline), PHASE-0.12 (Prisma schema)
```

---

## Labels

| Category | Values |
|----------|--------|
| Phase | `phase-0`, `phase-1`, `phase-2`, ... |
| Type | `feature`, `bug`, `chore`, `refactor`, `docs` |
| Complexity | `simple`, `medium`, `complex`, `critical` |
| Agent | `@BE`, `@FE`, `@ARC`, `@QA`, `@OPS`, `@SEC` |

---

## Complexity Estimation

| Level | Criteria | Typical Duration |
|-------|----------|-----------------|
| Simple | Single file, <50 lines, no integration | 1 agent turn |
| Medium | 2-5 files, module creation, basic integration | 2-3 agent turns |
| Complex | Multi-module, cross-service, new patterns | 3-5 agent turns |
| Critical | Architecture change, security, production | 5+ turns + review |

---

## Example Ticket

```markdown
# PHASE-1.2 — Implement task intake service

## Description

Create the tasks module in Schitzo Core handling task creation, listing, and retrieval.
Wire Telegram messages into task creation.

## Target Files

- apps/core/src/tasks/tasks.module.ts
- apps/core/src/tasks/tasks.service.ts
- apps/core/src/tasks/tasks.controller.ts
- apps/core/src/tasks/tasks.repository.ts
- apps/core/src/tasks/dto/create-task.dto.ts
- apps/core/src/tasks/tasks.service.spec.ts

## Acceptance Criteria

- [ ] POST /tasks creates a task with status=pending
- [ ] GET /tasks returns paginated list (page, pageSize params)
- [ ] GET /tasks/:id returns single task or 404
- [ ] Telegram messages create tasks via TasksService
- [ ] Input validated with class-validator
- [ ] Unit tests pass for service and controller

## Testing Notes

1. npm run test -- --filter tasks
2. POST /tasks with valid body → 201
3. POST /tasks with empty body → 422
4. GET /tasks?page=1&pageSize=5 → paginated response

## Dependencies

Depends on: PHASE-0.12 (Prisma schema)

## Labels

phase-1, feature, medium, @BE
```
