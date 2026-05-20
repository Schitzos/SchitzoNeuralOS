# API Response Contract

## Response Envelope

### Success Response

```typescript
interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}
```

### Error Response

```typescript
interface ApiError {
  error: {
    code: string;        // Machine-readable (e.g., 'VALIDATION_ERROR')
    message: string;     // Human-readable description
    details?: unknown;   // Additional context (validation errors, etc.)
  };
}
```

### Pagination Meta

```typescript
interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
```

---

## HTTP Status Codes

| Status | Usage |
|--------|-------|
| `200 OK` | Successful GET, PATCH, DELETE |
| `201 Created` | Successful POST that creates a resource |
| `400 Bad Request` | Malformed request (invalid JSON, missing fields) |
| `401 Unauthorized` | Missing or invalid auth token |
| `403 Forbidden` | Valid auth but insufficient permissions |
| `404 Not Found` | Resource does not exist |
| `422 Unprocessable Entity` | Validation error (valid JSON but invalid data) |
| `409 Conflict` | State conflict (invalid status transition) |
| `500 Internal Server Error` | Unexpected server error |

---

## Examples

### Success (single resource)

```json
{
  "data": {
    "id": "task_abc123",
    "userPrompt": "Fix the login bug",
    "status": "pending",
    "createdAt": "2026-05-20T12:00:00.000Z"
  }
}
```

### Success (list with pagination)

```json
{
  "data": [
    { "id": "task_abc123", "status": "pending" },
    { "id": "task_def456", "status": "running" }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### Error (validation)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "userPrompt", "message": "must be a string" }
    ]
  }
}
```

### Error (not found)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Task not found"
  }
}
```

---

## Pagination Request

Query parameters:

| Param | Type | Default | Max |
|-------|------|---------|-----|
| `page` | number | 1 | — |
| `pageSize` | number | 20 | 100 |

---

## Rules

1. All responses use the envelope — no raw arrays or primitives.
2. All timestamps are ISO-8601 UTC (`2026-05-20T12:00:00.000Z`).
3. All IDs are strings (UUIDs).
4. Null fields are included in response (not omitted).
5. Empty lists return `{ "data": [], "meta": { ... } }`, not 404.
6. DELETE returns `{ "data": { "deleted": true } }`.
