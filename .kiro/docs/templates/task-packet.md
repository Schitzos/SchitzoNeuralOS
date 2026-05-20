# Task Packet Template

## Overview

The task packet is the approved handoff artifact from @PM → Agent Lead. It contains everything needed to execute a task without further clarification.

---

## Schema

```typescript
interface TaskPacket {
  // Identifiers
  task_id: string;
  project_id: string;
  workflow_run_id: string;

  // Task content
  user_prompt: string;              // Original user request
  implementation_prompt: string;    // Refined by PM with context
  acceptance_criteria: string[];    // Binary testable checklist items

  // Scope
  file_scope: string[];             // Files/directories in scope
  dependencies: string[];           // Prerequisite task IDs (must be Done)

  // Assignment
  assigned_agent: string;           // Agent alias (e.g., '@BE')
  model_tier_recommendation: 'small' | 'standard' | 'strongest';
  complexity_classification: 'simple' | 'medium' | 'complex' | 'critical';
  allowed_tools: string[];          // Tools the agent may use

  // Git
  git_branch_name: string;          // format: feature/PHASE-X.Y-slug

  // Tracking
  linked_github_issue_id: string;
  linked_kanban_card_id: string;
}
```

---

## Field Rules

| Field | Required | Notes |
|-------|----------|-------|
| task_id | Yes | Internal Schitzo Core ID |
| project_id | Yes | Target project |
| workflow_run_id | Yes | Created by Schitzo Core |
| user_prompt | Yes | Verbatim from user |
| implementation_prompt | Yes | PM-refined with context and constraints |
| acceptance_criteria | Yes | Minimum 2 items, binary testable |
| file_scope | Yes | At least one path |
| dependencies | No | Empty if no prerequisites |
| assigned_agent | Yes | Must be registered agent |
| model_tier_recommendation | Yes | Based on complexity |
| complexity_classification | Yes | PM determines from task analysis |
| allowed_tools | Yes | Subset of agent's capability policy |
| git_branch_name | Yes | Convention: `feature/PHASE-X.Y-slug` |
| linked_github_issue_id | Yes | Must exist before packet creation |
| linked_kanban_card_id | Yes | Must exist before packet creation |

---

## Example (PHASE-1.1)

```json
{
  "task_id": "task_abc123",
  "project_id": "proj_schitzo",
  "workflow_run_id": "wfr_xyz789",
  "user_prompt": "Implement Telegram bot webhook integration",
  "implementation_prompt": "Create apps/core/src/telegram/ module with TelegramModule, TelegramService, TelegramController. Implement POST /telegram/webhook endpoint receiving Telegram updates. Parse incoming messages extracting command + text. Validate sender against TELEGRAM_ALLOWED_USER_IDS. Write unit tests.",
  "acceptance_criteria": [
    "POST /telegram/webhook receives and parses Telegram updates",
    "Unauthorized senders receive 403",
    "Commands are parsed from message text",
    "Unit tests pass for message parsing and allowlist validation"
  ],
  "file_scope": [
    "apps/core/src/telegram/"
  ],
  "dependencies": [],
  "assigned_agent": "@BE",
  "model_tier_recommendation": "standard",
  "complexity_classification": "medium",
  "allowed_tools": ["fs_read", "fs_write", "shell", "code"],
  "git_branch_name": "feature/PHASE-1.1-telegram-webhook",
  "linked_github_issue_id": "issues/12",
  "linked_kanban_card_id": "card_tel001"
}
```

---

## Dispatch Rules

1. Task packet is only created AFTER GitHub issue and Kanban card exist.
2. All dependencies must be in `Done` status before dispatch.
3. Agent Lead may split a packet into sub-tasks but cannot expand scope.
4. If Agent Lead cannot execute, it returns the packet with a reason.
