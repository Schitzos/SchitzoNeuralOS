# 9Router API Contract

## Overview

9Router is the unified model gateway. Schitzo Core calls 9Router for all LLM interactions.

## Connection

| Field | Value |
|-------|-------|
| Base URL | `NINE_ROUTER_URL` env var |
| Auth | `X-API-Key: {NINE_ROUTER_API_KEY}` header |
| Content-Type | `application/json` |

---

## POST /chat/completions

### Request

```typescript
interface NineRouterRequest {
  model: string;                          // Model route ID (e.g., 'claude-sonnet-4-20250514', 'gpt-4o')
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;                       // Default: false
  temperature?: number;                   // Default: 0.7
  max_tokens?: number;                    // Default: 4096
  rtk?: boolean;                          // Enable RTK (if supported)
  caveman?: boolean;                      // Enable Caveman mode (if supported)
}
```

### Response (non-streaming)

```typescript
interface NineRouterResponse {
  id: string;                             // Response ID
  content: string;                        // Model output text
  model: string;                          // Actual model used
  provider_route: string;                 // Provider path (e.g., 'anthropic/claude-sonnet-4-20250514')
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  created_at: string;                     // ISO-8601
}
```

### Response (streaming)

SSE format. Each event:

```text
data: {"delta":"partial text","done":false}

data: {"delta":"","done":true,"usage":{"input_tokens":150,"output_tokens":320},"model":"claude-sonnet-4-20250514","provider_route":"anthropic/claude-sonnet-4-20250514"}
```

### Error Response

```typescript
interface NineRouterError {
  error: {
    code: string;                         // 'rate_limit', 'model_unavailable', 'invalid_request', 'provider_error'
    message: string;
    provider?: string;                    // Which provider failed
  };
}
```

| Error Code | HTTP Status | Retryable |
|------------|-------------|-----------|
| `rate_limit` | 429 | Yes (after backoff) |
| `model_unavailable` | 503 | Yes (try fallback) |
| `invalid_request` | 400 | No |
| `provider_error` | 502 | Yes |
| `timeout` | 504 | Yes |

---

## Retry Policy

| Param | Value |
|-------|-------|
| Max retries | 2 |
| Backoff | Exponential: 1s, 3s |
| Timeout per request | 120s |
| On max retries exhausted | Return `provider_error` to caller |

---

## RTK + Caveman Policy

- **RTK** (Reasoning Tokens): Enable by default for complex/critical tasks.
- **Caveman**: Enable by default where supported for cost savings.
- Both flags are passed in request body. 9Router ignores them if the model doesn't support them.

---

## Adapter Interface (Schitzo Core)

```typescript
// src/nine-router/nine-router.service.ts
interface ChatOptions {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  rtk?: boolean;
  caveman?: boolean;
}

interface ChatResult {
  content: string;
  model: string;
  providerRoute: string;
  inputTokens: number;
  outputTokens: number;
}

interface INineRouterService {
  chat(options: ChatOptions): Promise<ChatResult>;
}
```

---

## Usage Persistence

After every successful call, persist to `ModelUsage` table:

```typescript
{
  taskId,
  agentRunId,
  modelName: result.model,
  providerRoute: result.providerRoute,
  inputTokens: result.inputTokens,
  outputTokens: result.outputTokens,
  estimatedCost: calculateCost(result, pricingTable),
  pricingVersion: currentPricingVersion,
}
```

---

## Consumers

- `NineRouterService` (apps/core)
- `ModelCallService` (apps/core)
- Hermes runtime (via NineRouterService)
