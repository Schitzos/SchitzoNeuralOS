// Schitzo Core API client for the CLI
// Connects to the NestJS backend via HTTP

export interface CoreClientConfig {
  baseUrl: string;
  timeout?: number;
}

export interface TaskSubmitResponse {
  id: string;
  status: string;
  userPrompt: string;
  createdAt: string;
}

export interface TaskStatusResponse {
  id: string;
  status: string;
  userPrompt: string;
  completedAt?: string;
  createdAt: string;
}

export interface SystemStatusResponse {
  status: string;
  service: string;
  timestamp: string;
}

export class SchitzoCoreClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: CoreClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.timeout = config.timeout || 30000;
  }

  async healthCheck(): Promise<SystemStatusResponse> {
    const response = await this.fetch('/');
    return response as SystemStatusResponse;
  }

  async submitTask(userPrompt: string, options?: {
    taskType?: string;
    executionMode?: string;
    projectId?: string;
  }): Promise<TaskSubmitResponse> {
    const response = await this.fetch('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        userPrompt,
        projectId: options?.projectId || 'default',
        taskType: options?.taskType || 'feature',
        executionMode: options?.executionMode || 'single',
      }),
    });
    return response as TaskSubmitResponse;
  }

  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const response = await this.fetch(`/tasks/${taskId}`);
    return response as TaskStatusResponse;
  }

  async listTasks(options?: { status?: string; limit?: number }): Promise<{ data: TaskStatusResponse[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.limit) params.set('pageSize', String(options.limit));
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await this.fetch(`/tasks${query}`);
    return response as { data: TaskStatusResponse[]; total: number };
  }

  async sendWebhookMessage(chatId: number, text: string): Promise<void> {
    await this.fetch('/telegram/webhook', {
      method: 'POST',
      body: JSON.stringify({
        update_id: Date.now(),
        message: {
          message_id: Date.now(),
          chat: { id: chatId, type: 'private' },
          from: { id: chatId, is_bot: false, first_name: 'CLI' },
          text,
          date: Math.floor(Date.now() / 1000),
        },
      }),
    });
  }

  private async fetch(path: string, options?: RequestInit): Promise<unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await globalThis.fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new CoreClientError(
          `API error ${response.status}: ${body}`,
          response.status,
        );
      }

      return response.json();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new CoreClientError('Request timeout', 408);
      }
      if (error instanceof CoreClientError) throw error;
      throw new CoreClientError(
        `Connection failed: ${(error as Error).message}`,
        0,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export class CoreClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'CoreClientError';
  }
}
