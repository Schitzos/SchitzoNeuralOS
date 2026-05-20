import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HandleStatusCommandUseCase } from './handle-status-command.use-case';
import { TaskStatus } from '../../domain/enums';

describe('HandleStatusCommandUseCase', () => {
  let useCase: HandleStatusCommandUseCase;
  let mockTelegramPort: { sendMessage: ReturnType<typeof vi.fn>; sendTypingAction: ReturnType<typeof vi.fn> };
  let mockTaskRepository: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let mockJobQueue: {
    addJob: ReturnType<typeof vi.fn>;
    getJobStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockTelegramPort = {
      sendMessage: vi.fn().mockResolvedValue(undefined),
      sendTypingAction: vi.fn().mockResolvedValue(undefined),
    };
    mockTaskRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findMany: vi.fn().mockResolvedValue({ data: [], total: 0 }),
      update: vi.fn(),
      delete: vi.fn(),
    };
    mockJobQueue = {
      addJob: vi.fn(),
      getJobStatus: vi.fn().mockResolvedValue({ status: 'unknown' }),
    };
    useCase = new HandleStatusCommandUseCase(mockTelegramPort, mockTaskRepository, mockJobQueue);
  });

  describe('execute', () => {
    it('should send status message to chat', async () => {
      await useCase.execute(12345);

      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('SchitzoNeuralOS Status'),
      );
    });

    it('should return healthy status when no tasks exist', async () => {
      const result = await useCase.execute(12345);

      expect(result.systemHealth).toBe('healthy');
      expect(result.recentTasks.total).toBe(0);
    });

    it('should count task statuses correctly', async () => {
      mockTaskRepository.findMany.mockResolvedValue({
        data: [
          { status: TaskStatus.PENDING },
          { status: TaskStatus.QUEUED },
          { status: TaskStatus.RUNNING },
          { status: TaskStatus.SUCCESS },
          { status: TaskStatus.SUCCESS },
          { status: TaskStatus.FAILED },
        ],
        total: 6,
      });

      const result = await useCase.execute(12345);

      expect(result.recentTasks.total).toBe(6);
      expect(result.recentTasks.pending).toBe(2);
      expect(result.recentTasks.running).toBe(1);
      expect(result.recentTasks.completed).toBe(2);
      expect(result.recentTasks.failed).toBe(1);
    });

    it('should report degraded when fail rate > 50%', async () => {
      mockTaskRepository.findMany.mockResolvedValue({
        data: [
          { status: TaskStatus.FAILED },
          { status: TaskStatus.FAILED },
          { status: TaskStatus.FAILED },
          { status: TaskStatus.SUCCESS },
        ],
        total: 4,
      });

      const result = await useCase.execute(12345);

      expect(result.systemHealth).toBe('degraded');
    });

    it('should handle queue status errors gracefully', async () => {
      mockJobQueue.getJobStatus.mockRejectedValue(new Error('Queue not available'));

      const result = await useCase.execute(12345);

      expect(result.systemHealth).toBe('healthy');
      expect(result.queueStatus).toEqual({ waiting: 0, active: 0, completed: 0, failed: 0 });
    });

    it('should include queue stats in message', async () => {
      await useCase.execute(12345);

      const message = mockTelegramPort.sendMessage.mock.calls[0][1];
      expect(message).toContain('Queue');
      expect(message).toContain('Waiting');
      expect(message).toContain('Active');
    });
  });
});
