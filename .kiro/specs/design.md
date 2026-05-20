# Schitzo NeuralOS — High-Level System Design

**Status:** Architectural reference for Phase 0+ implementation  
**Derived from:** `.kiro/specs/requirement.md` v1.1

---

## 1. System Architecture Overview

Schitzo NeuralOS is a local-first, multi-agent AI orchestration platform composed of six primary components:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Input Layer                                   │
│   [Telegram Bot]    [Neural Console (Next.js)]    [CLI (future)]    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                     Schitzo Core (NestJS)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │
│  │ Task API │ │ Auth/    │ │ Approval │ │ Sync     │ │ Cost/   │  │
│  │          │ │ Policy   │ │ Engine   │ │ Service  │ │ Usage   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └─────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                  LangGraph JS Workflow Engine                        │
│  [PM Handoff] → [Agent Lead] → [Worker Nodes] → [QA] → [Finalize] │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                     Hermes Agent Runtime                             │
│  [Agent Lead Profile] [Specialist Profiles] [Tool Execution]        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                     9Router Model Gateway                            │
│  [Claude] [GPT/Codex] [Gemini] [Kimi] [Ollama] [Kiro Routes]       │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Role |
|-----------|------|
| **Schitzo Core** | Control plane — APIs, persistence, policy, approvals, integrations, cost tracking |
| **LangGraph JS** | Workflow orchestration — state machine, node execution, transitions, retries |
| **Hermes** | Agent runtime — executes agent profiles, tools, LLM interactions |
| **9Router** | Model gateway — unified endpoint, provider routing, fallback |
| **Neural Console** | Dashboard — pipeline visualization, analytics, project management |
| **Schitzo Link** | Telegram interface — task submission, approvals, governance |

---

## 2. Core Design Decisions

### Why NestJS

- TypeScript-native with strong DI, module system, and decorator patterns
- Aligns with the full-stack TypeScript strategy (shared types with Next.js dashboard)
- Built-in support for WebSocket/SSE (real-time dashboard events)
- Mature ecosystem for PostgreSQL (TypeORM/Prisma), Redis (BullMQ), and REST/GraphQL APIs
- Structured module boundaries map cleanly to the domain separation (tasks, projects, agents, approvals, sync)

### Why LangGraph JS

- Same TypeScript runtime as Schitzo Core — eliminates cross-process serialization and Python bridge complexity
- Native state-machine semantics for workflow nodes, transitions, and checkpointing
- Supports sequential, parallel, and conditional branching required by the agent pipeline
- Integrates directly with BullMQ worker processes without IPC overhead
- Keeps observability unified (single structured-log format, single tracing context)

### Why Hermes

- Purpose-built agent runtime with profile-based execution
- Separates agent reasoning from workflow orchestration (clean boundary)
- Supports structured input/output contracts for predictable integration
- Tool execution layer with configurable permissions
- Agent Lead + specialist pattern maps directly to Hermes profile architecture

### Why 9Router

- Unified model gateway abstracts provider differences
- Supports RTK + Caveman policies as default execution enhancements
- Enables model fallback, escalation, and route switching without code changes
- Provider-agnostic — adding new models is configuration, not implementation
- Cost/token tracking at the gateway level supplements Schitzo Core analytics

---

## 3. Data Flow

### Task Lifecycle: Input → Completion

```
1. INPUT
   User submits task via Telegram (/run) or Neural Console
   
2. INTAKE
   Schitzo Core validates request, creates internal task record
   
3. PLANNING
   Project Manager Agent creates GitHub issue + Hermes Kanban card
   Board status → To Do
   
4. QUEUE
   Schitzo Core enqueues workflow job via BullMQ
   
5. ORCHESTRATION
   Worker process starts LangGraph workflow run
   agent_lead_node invokes Hermes Agent Lead profile
   
6. DELEGATION
   Agent Lead selects/creates specialist agents
   Assigns file scopes for parallel safety
   
7. EXECUTION
   Worker agent nodes execute via Hermes runtime
   Tools (file/shell/git/test) run within project workspace
   Model calls route through 9Router
   Board status → In Progress
   
8. VALIDATION
   QA node runs: lint, typecheck, tests, runtime validation
   If fails → repair cycle (max 2 attempts)
   Board status → QA Review
   
9. APPROVAL (if needed)
   Workflow pauses, sends approval request to Telegram
   Resumes on /approve or blocks on timeout (24h)
   
10. FINALIZATION
    Results persisted, GitHub/Kanban synced
    Board status → Done
    Response sent to Telegram/Dashboard
```

### State Transitions

```
pending → queued → running → [waiting_approval] → success → done
                           → retrying → running (max 2)
                           → failed → blocked
                           → cancelled
```

---

## 4. Integration Points

### GitHub Integration

| Action | Trigger | Direction |
|--------|---------|-----------|
| Create issue | Task created | Schitzo Core → GitHub API |
| Update project board item | Status change | Schitzo Core → GitHub API |
| Create feature branch | Work starts | Agent → Git CLI |
| Create PR | QA passes (Phase 8) | Agent → GitHub API |
| Sync status | Workflow transitions | Schitzo Core Sync Service |

**Idempotency:** GitHub operations use `task_id` as idempotency key.

### Telegram (Schitzo Link)

| Function | Implementation |
|----------|---------------|
| Task submission | Webhook → Schitzo Core POST /telegram/webhook |
| Approval requests | Schitzo Core → Telegram Bot API (push) |
| Status updates | Workflow events → Telegram notifications |
| Project switching | /project commands → Schitzo Core |
| Compare selection | /choose command → workflow resume |

**Auth:** Telegram user ID allowlist.

### Hermes Kanban

| Action | Trigger |
|--------|---------|
| Create board | Project registered |
| Create card | Task created |
| Move card | Workflow status transition |
| Sync check | Schitzo Core Sync Service periodic validation |

**Source of truth:** Schitzo Core internal task record. Hermes Kanban is a projection.

### 9Router

| Concern | Implementation |
|---------|---------------|
| Model requests | Hermes → 9Router unified endpoint |
| Route selection | Model field in agent profile / task config |
| RTK/Caveman | Enabled by default on supported routes |
| Fallback | 9Router handles provider-level failover |
| Usage tracking | Response metadata → Schitzo Core model_usage table |

---

## 5. Security Model

### Authentication Baseline (Phase 0)

```
Single-user local mode:
- Backend API: auth token (env-configured)
- Dashboard: local admin token / authenticated session
- Telegram: user ID allowlist
- Backend binding: localhost only by default
```

### Approval Gates

| Risk Level | Policy |
|------------|--------|
| Safe tools (read, status, diff, lint, test) | Auto-execute |
| Controlled tools (write, patch, shell, commit) | Execute in semi_autonomous mode |
| High-risk (force push, delete outside workspace, production) | Always requires Telegram approval |
| Dynamic agent creation (elevated permissions) | Human approval required |
| Protected policy modification | Human approval required |

### Tool Sandboxing

```
- All execution restricted to registered project workspace
- Path traversal protection enforced
- Shell timeout: 120s, test timeout: 300s
- Max stdout/stderr capture: 1MB
- Orphan process cleanup on Windows
- Command logging for all tool executions
```

### Default Autonomy Level

```
semi_autonomous: safe tools auto-run, risky tools require approval
```

---

## 6. Deployment Architecture

### Process Model (PM2-managed)

```
┌─────────────────────────────────────────────┐
│                 PM2 Process Manager          │
├─────────────────────────────────────────────┤
│  schitzo-core-api    (NestJS HTTP/WS)       │
│  schitzo-worker      (BullMQ + LangGraph)   │
│  neural-console      (Next.js)              │
└─────────────────────────────────────────────┘
         │                    │
    ┌────▼────┐         ┌────▼────┐
    │PostgreSQL│         │  Redis  │
    └─────────┘         └─────────┘
```

### Service Responsibilities

| Process | Role |
|---------|------|
| **schitzo-core-api** | HTTP API, WebSocket/SSE, Telegram webhook, request validation, job enqueue |
| **schitzo-worker** | BullMQ consumer, LangGraph execution, Hermes invocation, tool execution |
| **neural-console** | Next.js dashboard, React Flow pipelines, real-time event display |

### Data Stores

| Store | Purpose |
|-------|---------|
| **PostgreSQL** | Canonical source of truth — tasks, workflows, agent runs, tool calls, usage, messages, artifacts metadata, migrations |
| **Redis** | BullMQ job queue, transient coordination, pub/sub for real-time events. NOT durable source of truth |

### Concurrency

```
global_workflow_concurrency = 1
per_project_concurrency = 1
parallel_agent_concurrency = 2 (when enabled)
queue_retry_attempts = 3 (exponential backoff)
```

### Crash Recovery

- PM2 auto-restarts crashed processes
- Worker startup detects orphaned workflows → marks as retrying/blocked
- BullMQ dead-letter queue catches exhausted retries
- Checkpoints saved after each major workflow node for resumability

### No Docker for MVP

Local-native deployment. Docker is deferred.

---

## 7. Cross-Platform Strategy

### Priority Order

```
1. Windows 10/11 — primary development and deployment target
2. macOS (Apple Silicon / Intel) — second platform
3. Linux — deferred, not required for MVP
```

### Runtime Abstraction Layer

A cross-platform module in Schitzo Core handles OS differences:

| Concern | Implementation |
|---------|---------------|
| Path normalization | `node:path` (win32/posix) |
| Shell execution | `cross-spawn` / `execa` for consistent child process handling |
| Environment variables | `dotenv` + OS-aware resolution |
| Process management | PM2 (cross-platform) |
| File system | `node:fs` with path normalization |

### Windows-Specific Considerations

```
- PowerShell as default shell (handle execution policy failures gracefully)
- Track spawned processes for orphan cleanup
- Handle long path names (>260 chars) where Node.js supports it
- Normalize line endings in file operations
- Handle drive letters in project paths (C:\Projects\...)
```

### Agent Runtime Context Injection

Every agent execution receives OS context:

```json
{
  "os": "Windows 11",
  "shell": "PowerShell",
  "project_path": "C:\\Projects\\schitzo-neural-os",
  "package_manager": "npm",
  "node_version": "20.x"
}
```

### Recommended Libraries

```
node:os          — OS detection
node:path        — path normalization
cross-spawn      — cross-platform process spawning
execa            — enhanced child process execution
dotenv           — environment variable loading
```

---

## Appendix: Key Constraints Summary

| Constraint | Value |
|------------|-------|
| Max provider retries | 2 |
| Max worker repair cycles | 2 |
| Max model escalations | 1 |
| Max dynamic agents per workflow | 3 |
| Dynamic agent depth limit | 1 |
| Approval timeout | 24 hours |
| Shell timeout | 120s |
| Test timeout | 300s |
| Test pass rate | 100% mandatory |
| Code coverage target | 90% minimum |
| Default timezone | UTC+7 |
| Git strategy | feature/<ticket>-<slug> → develop → main |
| Commit format | type(task-id): description |
