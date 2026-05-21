import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SchitzoCoreClient, CoreClientError } from './core-client';

describe('SchitzoCoreClient', () => {
  let client: SchitzoCoreClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new SchitzoCoreClient({ baseUrl: 'http://localhost:3000', timeout: 5000 });
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('healthCheck', () => {
    it('should return system status on success', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'ok', service: 'schitzo-core', timestamp: '2026-01-01T00:00:00Z' }),
      });

      const result = await client.healthCheck();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('schitzo-core');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/',
        expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
      );
    });

    it('should throw CoreClientError on HTTP error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        text: () => Promise.resolve('Service Unavailable'),
      });

      await expect(client.healthCheck()).rejects.toThrow(CoreClientError);
      await expect(client.healthCheck()).rejects.toThrow('API error 503');
    });
  });

  describe('submitTask', () => {
    it('should submit a task and return response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'task-123',
          status: 'pending',
          userPrompt: 'Fix the bug',
          createdAt: '2026-01-01T00:00:00Z',
        }),
      });

      const result = await client.submitTask('Fix the bug');

      expect(result.id).toBe('task-123');
      expect(result.status).toBe('pending');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/tasks',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Fix the bug'),
        }),
      );
    });

    it('should include task options in request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'task-456', status: 'pending', userPrompt: 'Refactor', createdAt: '' }),
      });

      await client.submitTask('Refactor', { taskType: 'refactor', executionMode: 'single' });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.taskType).toBe('refactor');
      expect(body.executionMode).toBe('single');
    });
  });

  describe('getTaskStatus', () => {
    it('should return task status', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'task-789',
          status: 'success',
          userPrompt: 'Done',
          completedAt: '2026-01-01T00:01:00Z',
          createdAt: '2026-01-01T00:00:00Z',
        }),
      });

      const result = await client.getTaskStatus('task-789');

      expect(result.status).toBe('success');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/tasks/task-789',
        expect.anything(),
      );
    });
  });

  describe('listTasks', () => {
    it('should list tasks with pagination', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          data: [{ id: 'task-1', status: 'pending', userPrompt: 'Task 1', createdAt: '' }],
          total: 1,
        }),
      });

      const result = await client.listTasks({ limit: 5 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/tasks?pageSize=5',
        expect.anything(),
      );
    });

    it('should filter by status', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], total: 0 }),
      });

      await client.listTasks({ status: 'running' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=running'),
        expect.anything(),
      );
    });
  });

  describe('error handling', () => {
    it('should throw on connection failure', async () => {
      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(client.healthCheck()).rejects.toThrow('Connection failed');
    });

    it('should include status code in error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not Found'),
      });

      try {
        await client.getTaskStatus('nonexistent');
      } catch (error) {
        expect(error).toBeInstanceOf(CoreClientError);
        expect((error as CoreClientError).statusCode).toBe(404);
      }
    });
  });
});
