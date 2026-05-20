import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessTaskUseCase } from './process-task.use-case';
import { TaskStatus } from '../../domain/enums';

describe('ProcessTaskUseCase', () => {
  let useCase: ProcessTaskUseCase;
  let mockNineRouter: { chat: ReturnType<typeof vi.fn> };
  let mockTaskRepository: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockNineRouter = {
      chat: vi.fn(),
    };
    mockTaskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn(),
    };
    useCase = new ProcessTaskUseCase(mockNineRouter, mockTaskRepository);
  });

  describe('execute', () => {
    it('should call 9Router and return result on success', async () => {
      mockNineRouter.chat.mockResolvedValue({
        id: 'resp-123',
        content: 'Here is the solution to your task.',
        model: 'claude-sonnet-4-20250514',
        providerRoute: 'anthropic/claude-sonnet-4-20250514',
        inputTokens: 200,
        outputTokens: 150,
      });

      const result = await useCase.execute({
        taskId: 'task-123',
        userPrompt: 'Fix the login bug',
      });

      expect(result.taskId).toBe('task-123');
      expect(result.response).toBe('Here is the solution to your task.');
      expect(result.model).toBe('claude-sonnet-4-20250514');
      expect(result.inputTokens).toBe(200);
      expect(result.outputTokens).toBe(150);
    });

    it('should update task status to running before processing', async () => {
      mockNineRouter.chat.mockResolvedValue({
        id: 'resp-123',
        content: 'Done',
        model: 'claude-sonnet-4-20250514',
        providerRoute: 'anthropic/claude-sonnet-4-20250514',
        inputTokens: 100,
        outputTokens: 50,
      });

      await useCase.execute({
        taskId: 'task-456',
        userPrompt: 'Do something',
      });

      // First call should set status to running
      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: TaskStatus.RUNNING }),
      );
    });

    it('should update task status to success after completion', async () => {
      mockNineRouter.chat.mockResolvedValue({
        id: 'resp-123',
        content: 'Done',
        model: 'claude-sonnet-4-20250514',
        providerRoute: 'anthropic/claude-sonnet-4-20250514',
        inputTokens: 100,
        outputTokens: 50,
      });

      await useCase.execute({
        taskId: 'task-789',
        userPrompt: 'Do something',
      });

      // Second call should set status to success
      expect(mockTaskRepository.update).toHaveBeenCalledTimes(2);
      expect(mockTaskRepository.update).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ status: TaskStatus.SUCCESS }),
      );
    });

    it('should update task status to failed on error', async () => {
      mockNineRouter.chat.mockRejectedValue(new Error('Model unavailable'));

      await expect(
        useCase.execute({
          taskId: 'task-fail',
          userPrompt: 'Do something',
        }),
      ).rejects.toThrow('Model unavailable');

      expect(mockTaskRepository.update).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ status: TaskStatus.FAILED }),
      );
    });

    it('should use custom model when provided', async () => {
      mockNineRouter.chat.mockResolvedValue({
        id: 'resp-123',
        content: 'Done',
        model: 'gpt-4o',
        providerRoute: 'openai/gpt-4o',
        inputTokens: 100,
        outputTokens: 50,
      });

      await useCase.execute({
        taskId: 'task-custom',
        userPrompt: 'Do something',
        model: 'gpt-4o',
      });

      expect(mockNineRouter.chat).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'gpt-4o' }),
      );
    });

    it('should use custom system prompt when provided', async () => {
      mockNineRouter.chat.mockResolvedValue({
        id: 'resp-123',
        content: 'Done',
        model: 'claude-sonnet-4-20250514',
        providerRoute: 'anthropic/claude-sonnet-4-20250514',
        inputTokens: 100,
        outputTokens: 50,
      });

      await useCase.execute({
        taskId: 'task-sys',
        userPrompt: 'Do something',
        systemPrompt: 'You are a code reviewer.',
      });

      expect(mockNineRouter.chat).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system', content: 'You are a code reviewer.' }),
          ]),
        }),
      );
    });

    it('should enable rtk and caveman by default', async () => {
      mockNineRouter.chat.mockResolvedValue({
        id: 'resp-123',
        content: 'Done',
        model: 'claude-sonnet-4-20250514',
        providerRoute: 'anthropic/claude-sonnet-4-20250514',
        inputTokens: 100,
        outputTokens: 50,
      });

      await useCase.execute({
        taskId: 'task-defaults',
        userPrompt: 'Do something',
      });

      expect(mockNineRouter.chat).toHaveBeenCalledWith(
        expect.objectContaining({ rtk: true, caveman: true }),
      );
    });
  });
});
