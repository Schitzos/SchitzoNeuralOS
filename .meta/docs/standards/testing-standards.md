# Testing Standards

## File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Unit test | `*.spec.ts` | `tasks.service.spec.ts` |
| Integration test | `*.e2e-spec.ts` | `control-loop.e2e-spec.ts` |

## File Location

Tests are colocated with source files:

```text
src/tasks/
  tasks.service.ts
  tasks.service.spec.ts
  tasks.controller.ts
  tasks.controller.spec.ts
```

Integration tests go in `test/e2e/`:

```text
apps/core/test/e2e/
  control-loop.e2e-spec.ts
```

---

## Test Structure

```typescript
describe('TaskService', () => {
  describe('create', () => {
    it('should create a task with pending status', async () => {
      // Arrange
      const input = createTaskInput();

      // Act
      const result = await service.create(input);

      // Assert
      expect(result.status).toBe('pending');
    });
  });
});
```

Pattern: `describe(Class) > describe(method) > it('should...')`

Always use Arrange/Act/Assert.

---

## Mocking Strategy

| Dependency | Strategy |
|------------|----------|
| External services (9Router, GitHub, Telegram) | `vi.fn()` mocks |
| PrismaService | Mock per method with `vi.fn()` |
| ConfigService | Provide test values |
| Internal pure logic | Real implementation (no mock) |
| BullMQ | Mock queue with `vi.fn()` |

### Prisma Mock Pattern

```typescript
const mockPrisma = {
  task: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
};
```

---

## Coverage Targets

| Layer | Minimum |
|-------|---------|
| Services | 90% |
| Controllers | 80% |
| Utilities | 95% |
| Overall | 90% |

100% test pass rate is mandatory.

---

## Integration Tests

- Use test database: `schitzo_neural_os_test`
- Clean up after each test (transaction rollback or truncate)
- No shared state between test files
- Mock all external HTTP calls (9Router, GitHub, Telegram)
- Use real Redis for queue tests (flush between tests)

---

## What NOT to Test

- Generated Prisma client code
- Third-party library internals
- Type-only files (interfaces, enums with no logic)
- NestJS decorators themselves
- Module boilerplate

---

## Test Data Factories

Use factory functions, never raw inline objects:

```typescript
// test/factories/task.factory.ts
export function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task_001',
    projectId: 'proj_001',
    userPrompt: 'Fix the login bug',
    status: 'pending',
    taskType: 'bug',
    difficulty: 'simple',
    executionMode: 'single',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}
```

---

## Example: Service Test

```typescript
import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './tasks.repository';
import { createTask } from '../../../test/factories/task.factory';

describe('TasksService', () => {
  let service: TasksService;
  let repo: { create: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    repo = { create: vi.fn() };
    const module = await Test.createTestingModule({
      providers: [TasksService, { provide: TaskRepository, useValue: repo }],
    }).compile();
    service = module.get(TasksService);
  });

  describe('create', () => {
    it('should create task with pending status', async () => {
      const expected = createTask({ status: 'pending' });
      repo.create.mockResolvedValue(expected);

      const result = await service.create({ userPrompt: 'Fix bug', projectId: 'proj_001' });

      expect(result.status).toBe('pending');
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' }),
      );
    });
  });
});
```
