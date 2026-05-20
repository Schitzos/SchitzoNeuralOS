import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskLoggerAdapter } from './task-logger.adapter';

describe('TaskLoggerAdapter', () => {
  let adapter: TaskLoggerAdapter;
  let mockPrisma: {
    log: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    mockPrisma = {
      log: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };
    adapter = new TaskLoggerAdapter(mockPrisma as any);
  });

  describe('log', () => {
    it('should create a log entry', async () => {
      mockPrisma.log.create.mockResolvedValue({
        id: 'log-1',
        taskId: 'task-123',
        level: 'info',
        message: 'Task started processing',
        metadata: null,
        createdAt: new Date('2026-01-01'),
      });

      const result = await adapter.log({
        taskId: 'task-123',
        level: 'info',
        message: 'Task started processing',
      });

      expect(result.id).toBe('log-1');
      expect(result.taskId).toBe('task-123');
      expect(result.level).toBe('info');
      expect(result.message).toBe('Task started processing');
      expect(mockPrisma.log.create).toHaveBeenCalledWith({
        data: {
          taskId: 'task-123',
          level: 'info',
          message: 'Task started processing',
          metadata: undefined,
        },
      });
    });

    it('should persist metadata as JSON', async () => {
      mockPrisma.log.create.mockResolvedValue({
        id: 'log-2',
        taskId: 'task-123',
        level: 'error',
        message: 'Model call failed',
        metadata: { model: 'claude-sonnet', errorCode: 'rate_limit' },
        createdAt: new Date('2026-01-01'),
      });

      const result = await adapter.log({
        taskId: 'task-123',
        level: 'error',
        message: 'Model call failed',
        metadata: { model: 'claude-sonnet', errorCode: 'rate_limit' },
      });

      expect(result.metadata).toEqual({ model: 'claude-sonnet', errorCode: 'rate_limit' });
    });
  });

  describe('getLogsForTask', () => {
    it('should return logs ordered by createdAt desc', async () => {
      mockPrisma.log.findMany.mockResolvedValue([
        { id: 'log-2', taskId: 'task-1', level: 'info', message: 'Done', metadata: null, createdAt: new Date('2026-01-02') },
        { id: 'log-1', taskId: 'task-1', level: 'info', message: 'Started', metadata: null, createdAt: new Date('2026-01-01') },
      ]);

      const result = await adapter.getLogsForTask('task-1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('log-2');
      expect(mockPrisma.log.findMany).toHaveBeenCalledWith({
        where: { taskId: 'task-1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should filter by level when provided', async () => {
      mockPrisma.log.findMany.mockResolvedValue([]);

      await adapter.getLogsForTask('task-1', { level: 'error' });

      expect(mockPrisma.log.findMany).toHaveBeenCalledWith({
        where: { taskId: 'task-1', level: 'error' },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should respect limit and offset', async () => {
      mockPrisma.log.findMany.mockResolvedValue([]);

      await adapter.getLogsForTask('task-1', { limit: 10, offset: 20 });

      expect(mockPrisma.log.findMany).toHaveBeenCalledWith({
        where: { taskId: 'task-1' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 20,
      });
    });
  });

  describe('countLogsForTask', () => {
    it('should count all logs for a task', async () => {
      mockPrisma.log.count.mockResolvedValue(15);

      const result = await adapter.countLogsForTask('task-1');

      expect(result).toBe(15);
      expect(mockPrisma.log.count).toHaveBeenCalledWith({
        where: { taskId: 'task-1' },
      });
    });

    it('should count logs filtered by level', async () => {
      mockPrisma.log.count.mockResolvedValue(3);

      const result = await adapter.countLogsForTask('task-1', 'error');

      expect(result).toBe(3);
      expect(mockPrisma.log.count).toHaveBeenCalledWith({
        where: { taskId: 'task-1', level: 'error' },
      });
    });
  });
});
