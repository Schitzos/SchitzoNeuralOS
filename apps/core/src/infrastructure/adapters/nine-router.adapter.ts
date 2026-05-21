import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  INineRouterPort,
  ChatOptions,
  ChatResult,
} from '../../application/ports/nine-router.port';

interface NineRouterApiResponse {
  id: string;
  content: string;
  model: string;
  provider_route: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  created_at: string;
}

interface NineRouterApiError {
  error: {
    code: string;
    message: string;
    provider?: string;
  };
}

const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 3000];
const REQUEST_TIMEOUT = 120000;
const RETRYABLE_CODES = ['rate_limit', 'model_unavailable', 'provider_error', 'timeout'];

@Injectable()
export class NineRouterAdapter implements INineRouterPort {
  private readonly logger = new Logger(NineRouterAdapter.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('NINE_ROUTER_URL') || 'http://localhost:20128/v1';
    this.apiKey = this.config.get<string>('NINE_ROUTER_API_KEY') || '';
  }

  async chat(options: ChatOptions): Promise<ChatResult> {
    const body = {
      model: options.model,
      messages: options.messages,
      stream: options.stream || false,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
      rtk: options.rtk,
      caveman: options.caveman,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await this.makeRequest(body);
        return this.mapResponse(response);
      } catch (error) {
        lastError = error as Error;
        const isRetryable = this.isRetryableError(error);

        if (!isRetryable || attempt === MAX_RETRIES) {
          break;
        }

        const delay = RETRY_DELAYS[attempt] || 3000;
        this.logger.warn(
          `9Router request failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${lastError.message}. Retrying in ${delay}ms...`,
        );
        await this.sleep(delay);
      }
    }

    this.logger.error(`9Router request failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
    throw lastError;
  }

  private async makeRequest(body: Record<string, unknown>): Promise<NineRouterApiResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null) as NineRouterApiError | null;
        const errorCode = errorBody?.error?.code || 'unknown';
        const errorMessage = errorBody?.error?.message || `HTTP ${response.status}`;

        const error = new NineRouterError(errorCode, errorMessage, response.status);
        throw error;
      }

      return await response.json() as NineRouterApiResponse;
    } finally {
      clearTimeout(timeout);
    }
  }

  private mapResponse(response: NineRouterApiResponse): ChatResult {
    return {
      id: response.id,
      content: response.content,
      model: response.model,
      providerRoute: response.provider_route,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof NineRouterError) {
      return RETRYABLE_CODES.includes(error.code);
    }
    if (error instanceof Error && error.name === 'AbortError') {
      return true;
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class NineRouterError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number,
  ) {
    super(`9Router error [${code}]: ${message}`);
    this.name = 'NineRouterError';
  }
}
