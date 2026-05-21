import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NineRouterAdapter, NineRouterError } from './nine-router.adapter';

const mockConfigService = {
  get: vi.fn((key: string) => {
    const config: Record<string, string> = {
      NINE_ROUTER_URL: 'http://localhost:20128/v1',
      NINE_ROUTER_API_KEY: 'test-api-key',
    };
    return config[key];
  }),
};

const mockSuccessResponse = {
  id: 'resp-123',
  content: 'Hello, I can help with that.',
  model: 'claude-sonnet-4-20250514',
  provider_route: 'anthropic/claude-sonnet-4-20250514',
  usage: {
    input_tokens: 150,
    output_tokens: 320,
  },
  created_at: '2026-05-20T12:00:00.000Z',
};

describe('NineRouterAdapter', () => {
  let adapter: NineRouterAdapter;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    adapter = new NineRouterAdapter(mockConfigService as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('chat', () => {
    it('should make a successful chat request', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      });

      const result = await adapter.chat({
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(result.id).toBe('resp-123');
      expect(result.content).toBe('Hello, I can help with that.');
      expect(result.model).toBe('claude-sonnet-4-20250514');
      expect(result.providerRoute).toBe('anthropic/claude-sonnet-4-20250514');
      expect(result.inputTokens).toBe(150);
      expect(result.outputTokens).toBe(320);
    });

    it('should send correct headers and body', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      });

      await adapter.chat({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'Hi' },
        ],
        temperature: 0.5,
        maxTokens: 2048,
        rtk: true,
        caveman: false,
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:20128/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key',
          },
        }),
      );

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.model).toBe('gpt-4o');
      expect(callBody.messages).toHaveLength(2);
      expect(callBody.temperature).toBe(0.5);
      expect(callBody.max_tokens).toBe(2048);
      expect(callBody.rtk).toBe(true);
      expect(callBody.caveman).toBe(false);
    });

    it('should use default temperature and max_tokens', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSuccessResponse),
      });

      await adapter.chat({
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(callBody.temperature).toBe(0.7);
      expect(callBody.max_tokens).toBe(4096);
      expect(callBody.stream).toBe(false);
    });

    it('should retry on retryable errors', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ error: { code: 'rate_limit', message: 'Too many requests' } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSuccessResponse),
        });

      const result = await adapter.chat({
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.content).toBe('Hello, I can help with that.');
    });

    it('should throw after max retries exhausted', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: { code: 'rate_limit', message: 'Too many requests' } }),
      });

      await expect(
        adapter.chat({
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      ).rejects.toThrow(NineRouterError);

      expect(fetchMock).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('should not retry on non-retryable errors', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: { code: 'invalid_request', message: 'Bad request' } }),
      });

      await expect(
        adapter.chat({
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      ).rejects.toThrow(NineRouterError);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should retry on provider_error (502)', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 502,
          json: () => Promise.resolve({ error: { code: 'provider_error', message: 'Upstream failed' } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSuccessResponse),
        });

      const result = await adapter.chat({
        model: 'claude-sonnet-4-20250514',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.content).toBe('Hello, I can help with that.');
    });
  });
});
