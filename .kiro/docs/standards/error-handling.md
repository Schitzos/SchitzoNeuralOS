# Error Handling Standards

## Error Taxonomy → HTTP Status Mapping

| ErrorType | HTTP Status | Retryable |
|-----------|-------------|-----------|
| `provider_error` | 502 | Yes (max 2) |
| `model_error` | 502 | Yes (max 2, then escalate) |
| `tool_error` | 500 | No |
| `validation_error` | 422 | No |
| `policy_error` | 403 | No |
| `approval_error` | 409 | No (wait for approval) |
| `workflow_error` | 500 | No |
| `infrastructure_error` | 503 | Yes (max 3) |
| `git_error` | 500 | No |
| `unknown_error` | 500 | No |

---

## Custom Exception Classes

```typescript
// src/common/exceptions/domain.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorType } from '@schitzo/types';

export class DomainException extends HttpException {
  constructor(
    public readonly errorType: ErrorType,
    message: string,
    status: HttpStatus,
    public readonly details?: unknown,
  ) {
    super({ error: { code: errorType.toUpperCase(), message, details } }, status);
  }

  static validation(message: string, details?: unknown) {
    return new DomainException('validation_error', message, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }

  static notFound(resource: string) {
    return new DomainException('validation_error', `${resource} not found`, HttpStatus.NOT_FOUND);
  }

  static conflict(message: string) {
    return new DomainException('workflow_error', message, HttpStatus.CONFLICT);
  }

  static provider(message: string) {
    return new DomainException('provider_error', message, HttpStatus.BAD_GATEWAY);
  }

  static policy(message: string) {
    return new DomainException('policy_error', message, HttpStatus.FORBIDDEN);
  }
}
```

---

## Global Exception Filter

```typescript
// src/common/filters/global-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body = { error: { code: 'UNKNOWN_ERROR', message: 'Internal server error' } };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      body = typeof res === 'object' ? (res as any) : { error: { code: 'ERROR', message: res } };
    }

    // Log structured error
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      correlationId: request.headers['x-correlation-id'],
      method: request.method,
      path: request.url,
      status,
      error: body.error,
    }));

    response.status(status).json(body);
  }
}
```

---

## Correlation ID

Propagate a correlation ID through every request for tracing:

```typescript
// src/common/middleware/correlation-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void) {
    req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || randomUUID();
    next();
  }
}
```

---

## Structured Log Format

Every log entry must include:

```json
{
  "timestamp": "2026-05-20T12:00:00.000Z",
  "level": "error",
  "correlationId": "uuid",
  "service": "schitzo-core",
  "method": "POST",
  "path": "/tasks",
  "message": "Task creation failed",
  "error": { "code": "VALIDATION_ERROR", "message": "..." },
  "metadata": {}
}
```

---

## User-Facing vs Internal Messages

| Context | Rule |
|---------|------|
| API response | Generic message, no stack traces, no internal details |
| Internal logs | Full error details, stack trace, correlation ID |
| Telegram | Friendly message with error type and task ID |

**Never expose:** stack traces, file paths, database queries, env vars, or internal IDs in API responses.

---

## Retry Policy

| Error Type | Retry | Backoff | Escalation |
|------------|-------|---------|------------|
| `provider_error` | 2 attempts | 1s, 3s | Fallback to alt provider |
| `model_error` | 2 attempts | 1s, 3s | Escalate to stronger model (once) |
| `infrastructure_error` | 3 attempts | 1s, 3s, 9s | Alert + block |
| All others | No retry | — | Fail immediately |
