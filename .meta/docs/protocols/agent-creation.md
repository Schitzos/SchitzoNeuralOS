# Dynamic Agent Creation Protocol

## Overview

Agent Lead may request new specialist agents during runtime. Schitzo Core evaluates the request and decides whether to activate the agent automatically or require human approval.

## Required Metadata

Every dynamic agent request must include:

| Field | Description |
|-------|-------------|
| `agent_name` | Unique identifier for the agent |
| `role` | Functional role description |
| `reason_needed` | Why existing agents cannot handle this |
| `task_categories` | Types of tasks this agent handles |
| `allowed_tools` | Tools the agent may use |
| `default_model_tier` | Primary model tier |
| `fallback_model_tier` | Fallback if primary unavailable |
| `collaboration_rules` | How it interacts with other agents |
| `qa_review_expectations` | What QA checks apply to its output |
| `permanent_or_temporary` | Lifecycle scope |
| `scope` | Project/task scope restriction |
| `created_by` | Which agent/workflow requested it |
| `expires_after_task` | Auto-deactivate after task completion |

## Auto-Approve Conditions

A dynamic agent is created automatically (no human approval) if ALL of:

- Agent is **temporary** (expires after task).
- Agent is **scoped** to the current project/task.
- Tool permissions are within existing **low-risk policy** (safe/controlled only).
- Model/cost tier remains within **configured budget**.
- No **production or destructive** permission is requested.

## Human Approval Required

Human approval (via Telegram or Neural Console) is required if ANY of:

- Elevated shell permissions are requested.
- Destructive tools are requested (rm -rf, git push --force, etc.).
- Production access is requested.
- The request exceeds budget policy.
- The agent should become **permanent**.

## Approval Flow

```
1. Agent Lead sends creation request to Schitzo Core.
2. Schitzo Core evaluates against auto-approve conditions.
3a. If auto-approved → agent created, status=active, workflow continues.
3b. If human approval needed → workflow pauses, notification sent.
4. Human approves/rejects via Telegram (/approve, /reject) or Neural Console.
5. On approve → agent created, workflow resumes.
6. On reject → Agent Lead informed, must use existing agents or fail gracefully.
```

## Limits

| Constraint | Value |
|------------|-------|
| Max dynamic agents per workflow | 3 |
| Depth limit (agents creating agents) | 1 |
| Approval timeout | 24 hours |

## Capability Promotion

A temporary agent may be promoted to permanent if:

1. Human explicitly approves promotion.
2. Agent has demonstrated value across multiple tasks.
3. Promotion request includes justification.

Promotion always requires human approval — never auto-approved.

## Deactivation

- Temporary agents are deactivated when their task completes.
- Expired agents are cleaned up by the retention job.
- Permanent agents persist until manually deactivated.
