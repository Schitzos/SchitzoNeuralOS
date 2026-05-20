import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskIntakeUseCase } from './task-intake.use-case';
import { Task } from '../../domain/entities/task.entity';
import { TaskId, UserPrompt } from '../../domain/value-objects';
import { TaskStatus, TaskType, ExecutionMode } from '../../domain/enums';

function createMockTask(overrides: Partial<{ prompt: string; taskType: TaskType }> = {}): Task {
  const id = new TaskId('task-123456-abc');
  const prompt = new UserPrompt(overrides.prompt || 'Test task prompt');
  return new Task(
    id,
    prompt,
    'default',
    TaskStatus.PENDING,
    overrides.taskType || TaskType.FEATURE,
    ExecutionMode.SINGLE,
    new Date('2026-01-01'),
  );
}

describe('TaskIntakeUseCase', () => {
  let useCase: TaskIntakeUseCase;
  let mockTaskRepository: { create: ReturnType<typeof vi.fn>; findById: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockTaskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new TaskIntakeUseCase(mockTaskRepository);
  });

  describe('submit', () => {
    it('should create a task with pending status', async () => {
      const mockTask = createMockTask();
      mockTaskRepository.create.mockResolvedValue(mockTask);

      const result = await useCase.submit({
        userPrompt: 'Implement user authentication',
        sourceType: 'telegram',
        sourceChatId: 12345,
      });

      expect(result.taskId).toBe('task-123456-abc');
      expect(result.status).toBe('pending');
      expect(result.message).toContain('task-123456-abc');
      expect(mockTaskRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should classify bug fix tasks correctly', async () => {
      const mockTask = createMockTask({ taskType: TaskType.BUG_FIX });
      mockTaskRepository.create.mockResolvedValue(mockTask);

      await useCase.submit({
        userPrompt: 'Fix the login error on mobile',
        sourceType: 'telegram',
        sourceChatId: 12345,
      });

      const createdTask = mockTaskRepository.create.mock.calls[0][0] as Task;
      expect(createdTask.taskType).toBe(TaskType.BUG_FIX);
    });

    it('should classify refactor tasks correctly', async () => {
      const mockTask = createMockTask({ taskType: TaskType.REFACTOR });
      mockTaskRepository.create.mockResolvedValue(mockTask);

      await useCase.submit({
        userPrompt: 'Refactor the database layer',
        sourceType: 'telegram',
        sourceChatId: 12345,
      });

      const createdTask = mockTaskRepository.create.mock.calls[0][0] as Task;
      expect(createdTask.taskType).toBe(TaskType.REFACTOR);
    });

    it('should classify documentation tasks correctly', async () => {
      const mockTask = createMockTask({ taskType: TaskType.DOCUMENTATION });
      mockTaskRepository.create.mockResolvedValue(mockTask);

      await useCase.submit({
        userPrompt: 'Update the README with new API docs',
        sourceType: 'telegram',
        sourceChatId: 12345,
      });

      const createdTask = mockTaskRepository.create.mock.calls[0][0] as Task;
      expect(createdTask.taskType).toBe(TaskType.DOCUMENTATION);
    });

    it('should classify testing tasks correctly', async () => {
      const mockTask = createMockTask({ taskType: TaskType.TESTING });
      mockTaskRepository.create.mockResolvedValue(mockTask);

      await useCase.submit({
        userPrompt: 'Add unit tests for the auth module',
        sourceType: 'telegram',
        sourceChatId: 12345,
      });

      const createdTask = mockTaskRepository.create.mock.calls[0][0] as Task;
      expect(createdTask.taskType).toBe(TaskType.TESTING);
    });

    it('should default to feature type for unclassified prompts', async () => {
      const mockTask = createMockTask({ taskType: TaskType.FEATURE });
      mockTaskRepository.create.mockResolvedValue(mockTask);

      await useCase.submit({
        userPrompt: 'Add a new dashboard page',
        sourceType: 'telegram',
        sourceChatId: 12345,
      });

      const createdTask = mockTaskRepository.create.mock.calls[0][0] as Task;
      expect(createdTask.taskType).toBe(TaskType.FEATURE);
    });

    it('should use default project ID when none provided', async () => {
      const mockTask = createMockTask();
      mockTaskRepository.create.mockResolvedValue(mockTask);

      await useCase.submit({
        userPrompt: 'Some task',
        sourceType: 'telegram',
      });

      const createdTask = mockTaskRepository.create.mock.calls[0][0] as Task;
      expect(createdTask.projectId).toBe('default');
    });

    it('should use provided project ID', async () => {
      const mockTask = createMockTask();
      mockTaskRepository.create.mockResolvedValue(mockTask);

      await useCase.submit({
        userPrompt: 'Some task',
        sourceType: 'cli',
        projectId: 'proj-123',
      });

      const createdTask = mockTaskRepository.create.mock.calls[0][0] as Task;
      expect(createdTask.projectId).toBe('proj-123');
    });

    it('should accept tasks from different sources', async () => {
      const mockTask = createMockTask();
      mockTaskRepository.create.mockResolvedValue(mockTask);

      const sources = ['telegram', 'cli', 'api'] as const;

      for (const source of sources) {
        await useCase.submit({
          userPrompt: 'A task',
          sourceType: source,
        });
      }

      expect(mockTaskRepository.create).toHaveBeenCalledTimes(3);
    });
  });
});
