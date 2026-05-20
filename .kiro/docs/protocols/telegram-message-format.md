# Telegram Message Format Protocol

## General Rules

- Maximum message length: 4096 characters
- Truncate with `...` suffix when exceeding limit
- Use Telegram MarkdownV2 formatting
- Escape special characters in dynamic content

---

## Status Emojis

| Status | Emoji |
|--------|-------|
| pending | ⏳ |
| running | 🔄 |
| success | ✅ |
| failed | ❌ |
| blocked | 🚫 |
| waiting_approval | ⚠️ |
| cancelled | 🛑 |

---

## Message Templates

### Task Acknowledged

```text
✅ Task #{{id}} created
{{prompt_preview}}
```

`prompt_preview`: max 200 chars.

### Status (Single Task)

```text
📋 Task #{{id}}
Status: {{emoji}} {{status}}
Agent: {{agent}}
Tokens: {{tokens}}
Cost: ${{cost}}
```

### Status (List)

```text
📋 Recent Tasks:
1. {{emoji}} #{{id}} — {{prompt_preview}}
2. {{emoji}} #{{id}} — {{prompt_preview}}
3. {{emoji}} #{{id}} — {{prompt_preview}}
```

Max 10 tasks. `prompt_preview`: max 60 chars.

### Approval Request

```text
⚠️ Approval Required

Task: #{{id}}
Action: {{action}}
Risk: {{level}}

Reply /approve {{id}} or /reject {{id}}
```

### Task Complete

```text
✅ Task #{{id}} Done
{{summary}}

Tokens: {{total_tokens}}
Cost: ${{cost}}
Duration: {{duration}}
```

`summary`: max 500 chars. Duration format: `Xm Ys`.

### Error Notification

```text
❌ Task #{{id}} Failed
{{error_type}}: {{message}}
```

`message`: max 300 chars.

### Compare Mode Results

```text
🏟️ Compare Mode — Task #{{id}}

1. {{model_route}}
   Cost: ${{cost}} | Tokens: {{tokens}}
   Tests: {{test_result}}

2. {{model_route}}
   Cost: ${{cost}} | Tokens: {{tokens}}
   Tests: {{test_result}}

Reply /choose {{id}} {{model_name}}
```

---

## Formatting Rules

| Field | Format |
|-------|--------|
| Cost | 4 decimal places (`$0.0042`) |
| Duration | `Xm Ys` (e.g., `2m 34s`) |
| Tokens | Comma-separated (`12,450`) |
| Timestamps | Relative when <24h (`3m ago`), date otherwise |

---

## Truncation Limits

| Field | Max Length |
|-------|-----------|
| prompt_preview (acknowledged) | 200 chars |
| prompt_preview (list) | 60 chars |
| summary (complete) | 500 chars |
| error message | 300 chars |
| full message | 4096 chars |
