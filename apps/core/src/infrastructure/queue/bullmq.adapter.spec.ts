import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BullMQAdapter } from './bullmq.adapter';

// Mock BullMQ
vi.mock('bullmq', () => {
  const mockAdd = vi.fn().mockResolvedValue({ id: 'job-123' });
  const mockGetJob = vi.fn();
  const mockClose = vi.fn().mockResolvedValue(undefined);

  return {
    Queue: vi.fn().mockImplementation(() => ({
      add: mockAdd,
      getJob: mockGetJob,
      close: mockClose,
    })),
    Worker: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      close: mockClose,
    })),
    Job: vi.fn(),
  };
});

const mockConfigService = {
  get: vi.fn((key: string) => {
    const config: Record<string, string> = {
      REDIS_URL: 'redis://localhost:6379',
    };
    return config[key];
  }),
};

describe('BullMQAdapter', () => {
  let adapter: BullMQAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new BullMQAdapter(mockConfigService as never);
  });

  describe('addJob', () => {
    it('should add a job to the queue and return job result', async () => {
      const jobData = {
        taskId: 'task-123',
        userPrompt: 'Fix the login bug',
        taskType: 'bug_fix',
        projectId: 'default',
        sourceType: 'telegram',
        sourceChatId: 12345,
      };

      const result = await adapter.addJob(jobData);

      expect(result.jobId).toBe('job-123');
      expect(result.status).toBe('queued');
    });

    it('should configure job with retry options', async () => {
      const { Queue } = await import('bullmq');
      const mockQueue = (Queue as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;

      await adapter.addJob({
        taskId: 'task-456',
        userPrompt: 'Add feature',
        taskType: 'feature',
        projectId: 'default',
        sourceType: 'cli',
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-task',
        expect.objectContaining({ taskId: 'task-456' }),
        expect.objectContaining({
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        }),
      );
    });
  });

  describe('getJobStatus', () => {
    it('should return job status when job exists', async () => {
      const { Queue } = await import('bullmq');
      const mockQueue = (Queue as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
      mockQueue.getJob.mockResolvedValue({
        id: 'job-123',
        getState: vi.fn().mockResolvedValue('active'),
      });

      const result = await adapter.getJobStatus('job-123');

      expect(result).toEqual({
        jobId: 'job-123',
        status: 'active',
      });
    });

    it('should return null when job does not exist', async () => {
      const { Queue } = await import('bullmq');
      const mockQueue = (Queue as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
      mockQueue.getJob.mockResolvedValue(null);

      const result = await adapter.getJobStatus('nonexistent');

      expect(result).toBeNull();
    });

    it('should map waiting state to queued', async () => {
      const { Queue } = await import('bullmq');
      const mockQueue = (Queue as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
      mockQueue.getJob.mockResolvedValue({
        id: 'job-789',
        getState: vi.fn().mockResolvedValue('waiting'),
      });

      const result = await adapter.getJobStatus('job-789');

      expect(result?.status).toBe('queued');
    });

    it('should map completed state correctly', async () => {
      const { Queue } = await import('bullmq');
      const mockQueue = (Queue as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
      mockQueue.getJob.mockResolvedValue({
        id: 'job-done',
        getState: vi.fn().mockResolvedValue('completed'),
      });

      const result = await adapter.getJobStatus('job-done');

      expect(result?.status).toBe('completed');
    });

    it('should map failed state correctly', async () => {
      const { Queue } = await import('bullmq');
      const mockQueue = (Queue as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;
      mockQueue.getJob.mockResolvedValue({
        id: 'job-fail',
        getState: vi.fn().mockResolvedValue('failed'),
      });

      const result = await adapter.getJobStatus('job-fail');

      expect(result?.status).toBe('failed');
    });
  });

  describe('lifecycle', () => {
    it('should close queue on module destroy', async () => {
      const { Queue } = await import('bullmq');
      const mockQueue = (Queue as unknown as ReturnType<typeof vi.fn>).mock.results[0].value;

      await adapter.onModuleDestroy();

      expect(mockQueue.close).toHaveBeenCalled();
    });
  });
});
