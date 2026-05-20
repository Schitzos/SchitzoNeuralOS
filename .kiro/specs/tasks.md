# Schitzo NeuralOS — Detailed Task Reference

**Last Updated:** 2026-05-20
**Source:** `.kiro/specs/requirement.md` v1.1

---

## Phase 0 — Project Foundation

### PHASE-0.1 — Initialize GitHub repository
Agent: @OPS
Prompt: Create the Schitzo NeuralOS GitHub repository. Initialize with `main` and `develop` branches. Add README.md, .gitignore (Node.js + TypeScript + .env + OS artifacts), and LICENSE (private). Configure branch protection on `main` requiring PR reviews. Set `develop` as default branch. Confirm repo is accessible and cloneable. Acceptance: repo exists, both branches present, protection rules active.

### PHASE-0.2 — Setup GitHub project board
Agent: @PM
Prompt: Create a GitHub Project board for Schitzo NeuralOS linked to the repository. Add columns: Backlog, To Do, In Progress, QA Review, Done, Failed, Blocked. Verify issues can be moved between columns. Acceptance: board exists with all 7 columns, linked to repo.

### PHASE-0.3 — Setup issue and PR templates
Agent: @OPS
Prompt: Create `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/feature_request.md`, `.github/ISSUE_TEMPLATE/task.md`, and `.github/PULL_REQUEST_TEMPLATE.md`. Task template must include fields: Task ID, Description, Acceptance Criteria, Testing Notes. PR template must include: Summary, Testing, Linked Issue checklist. Acceptance: templates render correctly on GitHub new issue/PR pages.

### PHASE-0.4 — Setup monorepo workspace (npm workspaces)
Agent: @ARC
Prompt: Initialize npm workspaces monorepo at project root. Structure: `apps/core` (NestJS), `apps/console` (Next.js), `packages/shared` (utilities), `packages/types` (TypeScript types). Configure root `package.json` with workspace paths. Add shared scripts: `dev:core`, `dev:console`, `build`, `lint`, `test`. Create `tsconfig.base.json` with strict mode and path aliases. Acceptance: `npm install` resolves all workspaces, shared packages importable from apps.

### PHASE-0.5 — Setup NestJS Schitzo Core backend
Agent: @BE
Prompt: Initialize NestJS application in `apps/core/` with TypeScript strict mode. Create AppModule and HealthModule with `GET /health` endpoint returning `{ status: 'ok' }`. Configure `tsconfig.json` extending base with path aliases. Add `npm run dev:core` script starting on port 3001. Acceptance: `npm run dev:core` starts server, `GET http://localhost:3001/health` returns 200.

### PHASE-0.6 — Setup Next.js Neural Console dashboard
Agent: @FE
Prompt: Initialize Next.js 14+ app in `apps/console/` with TypeScript, Tailwind CSS, and App Router. Create minimal landing page at `/` showing "Neural Console" title. Configure `npm run dev:console` to start on port 3000. Acceptance: `npm run dev:console` starts dashboard, page renders without errors, Tailwind classes work.

### PHASE-0.7 — Setup shared TypeScript packages
Agent: @ARC
Prompt: Create `packages/shared/` with utility functions (date formatting via `formatDate()`, ID generation via `generateId()`) and `packages/types/` with shared TypeScript interfaces: TaskStatus enum, WorkflowState enum, AgentRole enum, ErrorType enum (matching spec Section 28.6). Export all from `index.ts`. Acceptance: both packages compile, importable from `apps/core` and `apps/console`.

### PHASE-0.8 — Setup ESLint and Prettier
Agent: @OPS
Prompt: Configure ESLint with `@typescript-eslint/parser` and Prettier integration at monorepo root. Create `.eslintrc.js` (extends recommended + typescript + prettier) and `.prettierrc` (singleQuote, trailingComma all, semi true). Add `lint` and `format` scripts to root `package.json`. Create `.vscode/settings.json` recommending extensions. Acceptance: `npm run lint` passes on all workspaces.

### PHASE-0.8b — Setup Husky + Commitlint
Agent: @OPS
Prompt: Install and configure Husky with pre-commit hook running `lint-staged` (lint + format staged files) and commit-msg hook running `commitlint` with `@commitlint/config-conventional`. Acceptance: non-conventional commit messages (e.g., "fixed stuff") are rejected, conventional messages (e.g., "feat(core): add health endpoint") pass.

### PHASE-0.9 — Setup Vitest and CI baseline
Agent: @QA
Prompt: Configure Vitest as test runner for all workspaces. Create `vitest.config.ts` at root and per-workspace configs. Add sample test `apps/core/src/health/health.controller.spec.ts` testing the health endpoint. Create `.github/workflows/ci.yml` running lint, typecheck (`tsc --noEmit`), and tests on push/PR to `develop` and `main`. Acceptance: `npm test` passes, CI triggers on PR.

### PHASE-0.10 — Setup local environment files
Agent: @OPS
Prompt: Create `.env.example` at monorepo root with documented variables: DATABASE_URL, REDIS_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_ALLOWED_USER_IDS, NINE_ROUTER_URL, AUTH_TOKEN, PORT_CORE=3001, PORT_CONSOLE=3000. Add `.env` to `.gitignore`. Document env setup in CONTRIBUTING.md. Acceptance: `.env.example` exists with all vars documented, `.env` is gitignored.

### PHASE-0.11 — Setup early authentication baseline
Agent: @SEC
Prompt: Implement NestJS AuthGuard in `apps/core/src/auth/` that validates Bearer token from `AUTH_TOKEN` env var. Apply globally with `@Public()` decorator for excluded routes (e.g., /health). Add Telegram allowlist validation checking sender ID against `TELEGRAM_ALLOWED_USER_IDS` (comma-separated). Write unit tests for guard (valid token passes, invalid rejects, public routes bypass). Acceptance: all non-public endpoints require valid token, tests pass.

### PHASE-0.12 — Setup Prisma schema and migrations
Agent: @BE
Prompt: Initialize Prisma in `apps/core/` with PostgreSQL provider. Create schema with models matching spec Section 21: User, Project, Task, AgentRun, ToolCall, ModelUsage, ModelPricing, AgentMessage, Artifact, Log. Include all fields from spec. Run `prisma migrate dev --name init` to generate initial migration. Export PrismaService as NestJS provider in `apps/core/src/prisma/prisma.service.ts`. Acceptance: migration runs against clean PostgreSQL, all tables created with correct columns.

### PHASE-0.13 — Define Product Owner Agent profile
Agent: @ARC
Prompt: Create `docs/agents/product-owner.md` defining the PO Agent profile per spec Section 7.2. Include: role description, responsibilities (protect product intent, interpret spec, confirm MVP scope, approve/reject scope expansion, define acceptance criteria), system prompt template, allowed actions (read-only tools), collaboration rules with PM Agent, decision authority boundaries. Acceptance: document exists, covers all spec requirements, is versioned.

### PHASE-0.14 — Define Project Manager Agent profile
Agent: @ARC
Prompt: Create `docs/agents/project-manager.md` defining the PM Agent profile per spec Sections 7.3-7.4. Include: role description, responsibilities (translate spec to tickets, create GitHub issues, manage board status, create task packets, coordinate with PO and Agent Lead), system prompt template, allowed actions, handoff protocol to Agent Lead, governance boundaries. Acceptance: document exists, handoff boundary (planning vs runtime) clearly documented.

### PHASE-0.15 — Define Agent Creation Protocol
Agent: @ARC
Prompt: Create `docs/protocols/agent-creation.md` documenting the Dynamic Agent Creation Protocol per spec Section 7.6. Include: required metadata fields (agent_name, role, reason_needed, task_categories, allowed_tools, default_model_tier, scope, permanent_or_temporary, expires_after_task), auto-approve conditions, human-approval conditions, approval flow, capability promotion rules, max_dynamic_agents_per_workflow=3, depth_limit=1. Acceptance: protocol document complete, all conditions explicit.

### PHASE-0.16 — Document local developer workflow
Agent: @TW
Prompt: Create `CONTRIBUTING.md` at monorepo root. Document: prerequisites (Node 20+, PostgreSQL 15+, Redis), setup steps (clone, npm install, cp .env.example .env, edit .env, prisma migrate dev, npm run dev:core, npm run dev:console), development commands, Git branching strategy (feature/<ticket>-<slug> → develop → main), commit conventions (conventional commits), PR process, testing requirements (100% pass, 90% coverage target). Acceptance: a new developer can follow the guide end-to-end.

### PHASE-0.17 — Analyze Phase 1 agent requirements
Agent: @ARC
Prompt: Analyze Phase 1 deliverables (Telegram webhook, task intake, 9Router integration, BullMQ queue, model call, response service, status tracking, logs) and determine which specialist agents from the catalog (spec Section 7.7) are needed. Write analysis to `docs/agents/phase-1-analysis.md` including: recommended agents to create, their roles, required tools, model tier, and justification. At minimum evaluate: Backend Agent, DevOps Agent, 9Router Integration Agent, QA Agent. Acceptance: analysis document exists with clear recommendations.


---

## Phase 1 — Basic Control Loop

### PHASE-1.1 — Implement Telegram bot webhook integration
Agent: @BE
Prompt: Create `apps/core/src/telegram/` module with TelegramModule, TelegramService, TelegramController. Implement `POST /telegram/webhook` endpoint receiving Telegram updates. Parse incoming messages extracting command + text. Use `telegraf` or `node-telegram-bot-api`. Register webhook URL on startup. Validate sender against `TELEGRAM_ALLOWED_USER_IDS` env var. Write unit tests for message parsing and allowlist validation. Files: `apps/core/src/telegram/telegram.module.ts`, `telegram.service.ts`, `telegram.controller.ts`. Acceptance: webhook receives messages, unauthorized senders rejected, commands parsed correctly.

### PHASE-1.2 — Implement task intake service
Agent: @BE
Prompt: Create `apps/core/src/tasks/` module with TasksModule, TasksService, TasksController. Implement `POST /tasks` accepting `{ user_prompt, project_id?, task_type? }`. TasksService.create() validates input, creates Task record via Prisma (status=pending, execution_mode=single), returns created task. Implement `GET /tasks` (list with pagination: page, pageSize params) and `GET /tasks/:id`. Wire Telegram messages into TasksService.create(). Write unit tests. Acceptance: tasks created via API and Telegram, pagination works, GET returns correct data.

### PHASE-1.3 — Implement 9Router integration
Agent: @BE
Prompt: Create `apps/core/src/nine-router/` module with NineRouterModule, NineRouterService. Implement `NineRouterService.chat({ model, messages, options })` sending requests to 9Router endpoint (env: `NINE_ROUTER_URL`). Support streaming and non-streaming responses. Include RTK and Caveman flags in request body when supported. Handle provider errors with retry (max 2, exponential backoff). Return `{ content, input_tokens, output_tokens, model, provider_route }`. Write unit tests with mocked HTTP calls. Acceptance: successful model calls, retries on failure, token counts captured.

### PHASE-1.4 — Implement BullMQ job queue
Agent: @BE
Prompt: Create `apps/core/src/queue/` module with QueueModule, QueueService. Configure BullMQ with Redis connection from `REDIS_URL` env. Define queue `workflow-jobs` with default job options (attempts=3, exponential backoff). Implement `QueueService.enqueue(jobName, data)` and basic worker processor stub. Set `global_workflow_concurrency=1`. Add health check for Redis connection in HealthModule. Write unit tests. Acceptance: jobs enqueue and dequeue, Redis health check works, concurrency=1 enforced.

### PHASE-1.5 — Implement basic model call via 9Router
Agent: @BE
Prompt: Create `apps/core/src/model-call/model-call.service.ts` that: receives a task, constructs system prompt + user prompt, calls NineRouterService.chat(), persists ModelUsage record via Prisma (input_tokens, output_tokens, model_name, provider_route, estimated_cost using ModelPricing table), persists AgentRun record (agent_name='direct_call', status=success/failed). Return model response content. Seed ModelPricing table with initial pricing data. Write unit tests. Acceptance: model called, usage persisted, cost calculated.

### PHASE-1.6 — Implement Telegram response service
Agent: @BE
Prompt: Extend TelegramService with `sendMessage(chatId, text)` and `sendTaskResult(chatId, task, result)` methods. Format responses with task ID, status, and model output (truncated to Telegram's 4096 char limit with "..." suffix). Handle Telegram API errors with retry (max 1). Write unit tests. Acceptance: responses sent to Telegram, long messages truncated, errors handled gracefully.

### PHASE-1.7 — Implement task status tracking
Agent: @BE
Prompt: Extend TasksService with `updateStatus(taskId, newStatus)` enforcing valid state transitions (pending→queued→running→success/failed, running→cancelled). Log status changes to `logs` table via LogsService. Add `POST /tasks/:id/cancel` endpoint. Emit status-change events (prepare for future WebSocket/SSE). Write unit tests verifying valid transitions pass and invalid transitions throw. Acceptance: state machine enforced, invalid transitions rejected with descriptive error.

### PHASE-1.8 — Implement basic task logs
Agent: @BE
Prompt: Create `apps/core/src/logs/` module with LogsModule, LogsService. Implement `LogsService.log(taskId, level, message, metadata?)` persisting structured JSON logs to `logs` table via Prisma. Levels: debug, info, warn, error. Add `GET /tasks/:id/logs` endpoint with optional level filter and pagination. Write unit tests. Acceptance: logs persisted, queryable by task_id and level, pagination works.

### PHASE-1.9 — Implement /status command
Agent: @BE
Prompt: In TelegramService, handle `/status` command. Query most recent 5 tasks for the user, format as: `#ID — status — first 50 chars of prompt — created_at`. If no tasks, respond "No tasks found." Handle `/status <task_id>` showing detailed single-task status including agent_run info and token usage. Write unit tests. Acceptance: /status returns recent tasks, /status <id> returns detail, empty state handled.

### PHASE-1.10 — End-to-end control loop test
Agent: @QA
Prompt: Write integration test `apps/core/test/e2e/control-loop.e2e-spec.ts` validating full Phase 1 flow: 1) POST to /telegram/webhook with mock message, 2) verify Task record created status=pending, 3) verify job enqueued in BullMQ, 4) process job (mock 9Router response), 5) verify Task status=success, 6) verify ModelUsage record persisted, 7) verify Telegram response sent. Use test database and mock external services. Acceptance: test passes end-to-end, all assertions verified.

### PHASE-1.11 — Implement Schitzo CLI interactive terminal client
Agent: @BE
Prompt: Create `apps/cli/` package in the monorepo. Build an interactive terminal client (command: `schitzo`) using `ink` or raw Node.js readline. Features: interactive prompt for task input, streaming response display, `/status` command showing recent tasks, `/cancel <id>` command, connection status indicator, auth via stored token. Package as npm bin entry. Acceptance: `schitzo` command opens interactive session, can submit text and receive responses, `/status` works.

### PHASE-1.12 — CLI → Schitzo Core integration (task submission + status)
Agent: @BE
Prompt: Wire CLI client to Schitzo Core backend via HTTP (POST /tasks for submission, GET /tasks for status, POST /tasks/:id/cancel for cancellation). Support WebSocket/SSE for streaming responses when available. CLI sends same payload as Telegram — backend treats it identically. Auth via Bearer token from local config file (`~/.schitzo/config.json`). Acceptance: task submitted from CLI creates GitHub ticket (via @PM flow), executes through same pipeline as Telegram, response displayed in terminal.


---

## Phase 2 — LangGraph Pipeline Foundation

### PHASE-2.1 — LangGraph JS integration setup
Agent: @BE
Prompt: Install `@langchain/langgraph` and `@langchain/core` in `apps/core/`. Create `apps/core/src/workflow/` module with WorkflowModule. Create base graph builder in `apps/core/src/workflow/graph-builder.ts` initializing a StateGraph with Schitzo workflow state schema (workflow_run_id, task_id, project_id, current_node, status, messages[], agent_runs[], error). Write unit test creating and invoking a trivial 2-node graph. Acceptance: LangGraph compiles, minimal graph instantiates and runs.

### PHASE-2.2 — Workflow run creation service
Agent: @BE
Prompt: Create `apps/core/src/workflow/workflow-run.service.ts`. Implement `createRun(taskId, projectId)` that creates WorkflowRun record in new Prisma model (id, task_id, project_id, status=pending, current_node, started_at, completed_at, error, checkpoint_data JSON). Updates task status to queued. Enqueues BullMQ job with workflow_run_id. Add WorkflowRun model to Prisma schema, generate migration. Write unit tests. Acceptance: workflow run created, task status updated, job enqueued.

### PHASE-2.3 — Implement agent_lead_node
Agent: @BE
Prompt: Create `apps/core/src/workflow/nodes/agent-lead.node.ts`. This LangGraph node receives workflow state (task packet with user_prompt, project_context, allowed_tools) and: 1) constructs Agent Lead system prompt, 2) calls NineRouterService with strongest configured model, 3) parses response for delegation decisions (which specialist, execution plan, tool permissions), 4) returns updated state with delegation_plan. For Phase 2 MVP, simply returns single-worker plan. Write unit tests with mocked model responses. Acceptance: node executes, returns valid delegation plan.

### PHASE-2.4 — Implement task state transitions
Agent: @BE
Prompt: Create `apps/core/src/workflow/state-machine.ts` implementing canonical workflow state machine from spec Section 27.6. Define allowed transitions as map: `{ pending: ['queued','cancelled'], queued: ['running','cancelled'], running: ['waiting_approval','retrying','success','failed','blocked','cancelled'], ... }`. Implement `validateTransition(current, next): boolean` and `transitionWorkflow(runId, nextState): WorkflowRun`. Reject invalid transitions with descriptive error. Write unit tests covering all valid and invalid paths. Acceptance: all transitions validated correctly.

### PHASE-2.5 — Implement workflow state machine (full graph)
Agent: @BE
Prompt: Build full LangGraph graph in `apps/core/src/workflow/main-workflow.graph.ts`. Define nodes: agent_lead_node, worker_agent_node (stub), qa_validation_node (stub), final_response_node. Define edges with conditional routing: agent_lead → worker → qa_validation → (pass? final_response : worker retry). Compile graph. Export `runWorkflow(state)` function. Write integration test running graph end-to-end with stubbed nodes. Acceptance: graph compiles, executes happy path and retry path.

### PHASE-2.6 — Implement basic retry support
Agent: @BE
Prompt: In workflow graph, implement retry logic: if qa_validation_node returns failure, route back to worker_agent_node up to max_worker_repair_cycles=2. Track retry_count in workflow state. After max retries, transition to failed. For model errors, implement max_provider_retries=2 with exponential backoff in NineRouterService. After max model retries, attempt max_model_escalations=1 to stronger model. Write unit tests verifying retry counts and escalation. Acceptance: retries bounded, escalation works once, failure after max.

### PHASE-2.7 — Implement final_response_node
Agent: @BE
Prompt: Create `apps/core/src/workflow/nodes/final-response.node.ts`. This node: 1) extracts final result from workflow state, 2) updates WorkflowRun status to success, 3) updates Task status to success, 4) persists final agent_run and model_usage records, 5) triggers notification (calls TelegramService.sendTaskResult or emits event). Returns terminal state. Write unit tests. Acceptance: workflow completes, records persisted, notification sent.

### PHASE-2.8 — Implement approval_gate_node
Agent: @BE
Prompt: Create `apps/core/src/workflow/nodes/approval-gate.node.ts`. This node: 1) pauses workflow by setting status=waiting_approval, 2) creates Approval record in new Prisma model (id, workflow_run_id, task_id, approval_required_for, requested_at, timeout_at=now+24h, resume_from_node, resume_payload, decision, approved_by), 3) sends approval request to Telegram with action preview and /approve /reject commands, 4) returns paused state. Create `apps/core/src/approvals/` module with ApprovalsService handling approve/reject that resumes workflow. Write unit tests. Acceptance: workflow pauses, approval record created, resume works.

### PHASE-2.9 — Implement workflow cancellation
Agent: @BE
Prompt: Implement `WorkflowRunService.cancel(runId, reason)` that: 1) validates current state allows cancellation, 2) sets status=cancelled, 3) removes pending BullMQ job if queued, 4) updates Task status=cancelled, 5) persists cancellation reason in logs, 6) notifies via Telegram. Wire to `POST /tasks/:id/cancel` and Telegram `/cancel task_id` command. Write unit tests for each cancellable state. Acceptance: cancellation works from all valid states, invalid states rejected.

### PHASE-2.10 — Implement checkpointing
Agent: @BE
Prompt: Implement workflow checkpointing in `apps/core/src/workflow/checkpoint.service.ts`. After each major node completion, persist checkpoint data to WorkflowRun.checkpoint_data (JSON): current_node, state_snapshot, completed_node_ids, pending_node_ids, retry_count, approval_state. Implement `resumeFromCheckpoint(runId)` reconstructing LangGraph state from last checkpoint. Write unit tests verifying save/restore cycle. Acceptance: checkpoints saved after each node, resume reconstructs correct state.

### PHASE-2.11 — Implement worker process (BullMQ consumer)
Agent: @BE
Prompt: Create `apps/core/src/queue/workflow.processor.ts` as BullMQ Worker processing `workflow-jobs` queue. Processor: 1) loads WorkflowRun by ID, 2) transitions status to running, 3) invokes runWorkflow() with reconstructed state, 4) handles success/failure outcomes, 5) persists final state. Configure concurrency=1. Implement graceful shutdown (complete current job before exit). Add PM2 ecosystem config for worker process. Write unit tests. Acceptance: worker processes jobs, graceful shutdown works.

### PHASE-2.12 — End-to-end pipeline test
Agent: @QA
Prompt: Write integration test `apps/core/test/e2e/pipeline.e2e-spec.ts` validating: 1) create task via API, 2) workflow run created and queued, 3) BullMQ job processed, 4) agent_lead_node executes (mocked model), 5) worker_agent_node executes (mocked), 6) qa_validation_node passes, 7) final_response_node completes, 8) Task status=success, 9) WorkflowRun status=success, 10) all records persisted. Test cancellation flow separately. Use test DB, mock 9Router. Acceptance: both happy path and cancellation tests pass.


---

## Phase 3 — Hermes Runtime + Tool Execution

### PHASE-3.1 — Hermes runtime integration
Agent: @BE
Prompt: Create `apps/core/src/hermes/` module with HermesModule, HermesService. Implement `HermesService.execute(input: HermesInput): Promise<HermesOutput>` following spec Section 28.1 contract. Input: task_packet, agent_profile, project_context, memory_context, allowed_tools, model_route, workflow_run_id, task_id. Output: status, summary, messages, tool_calls, artifacts, token_usage, next_action, error. Create TypeScript interfaces in `packages/types/src/hermes.ts`. Integrate with NineRouterService for model calls. Write unit tests with mocked model responses. Acceptance: Hermes executes agent profiles, returns structured output.

### PHASE-3.2 — Implement filesystem.read tool
Agent: @BE
Prompt: Create `apps/core/src/tools/filesystem-read.tool.ts`. Input: `{ path, encoding? }`. Behavior: resolve path relative to project root, validate within project workspace (no traversal), read file content, return `{ content, size, encoding }`. Enforce max file size 1MB. Register in ToolRegistry. Write unit tests including path traversal rejection (e.g., `../../etc/passwd`). Acceptance: reads files within workspace, rejects traversal, respects size limit.

### PHASE-3.3 — Implement filesystem.write tool
Agent: @BE
Prompt: Create `apps/core/src/tools/filesystem-write.tool.ts`. Input: `{ path, content, createDirs? }`. Validate path within workspace, check if file exists (log overwrite warning), create parent dirs if createDirs=true, write content, return `{ path, size, created }`. Risk level: controlled. Log all writes to tool_calls table. Write unit tests including workspace boundary enforcement. Acceptance: writes files, creates dirs, logs calls, rejects outside workspace.

### PHASE-3.4 — Implement filesystem.patch tool
Agent: @BE
Prompt: Create `apps/core/src/tools/filesystem-patch.tool.ts`. Input: `{ path, patches: Array<{ oldText, newText }> }`. Validate path within workspace, read current file, apply patches sequentially (find oldText, replace with newText), fail if any oldText not found, write patched file, return `{ path, patchesApplied, newSize }`. Write unit tests for successful patch, missing text error, multiple patches. Acceptance: patches apply correctly, missing text fails gracefully.

### PHASE-3.5 — Implement shell.execute tool
Agent: @BE
Prompt: Create `apps/core/src/tools/shell-execute.tool.ts`. Input: `{ command, cwd?, timeout? }`. Validate cwd within workspace. Check command against risky-command list (rm -rf, format, del /s, sudo, npm publish, git push --force, git reset --hard — require approval). Spawn process using `execa` with timeout (default 120s). Capture stdout/stderr (max 1MB each). Kill on timeout. Return `{ exitCode, stdout, stderr, timedOut }`. Track spawned PIDs for orphan cleanup. Write unit tests including timeout and risky-command detection. Acceptance: commands execute, timeout kills, risky commands flagged.

### PHASE-3.6 — Implement git tools (status, diff, commit)
Agent: @BE
Prompt: Create `apps/core/src/tools/git.tool.ts` with sub-tools: `git.status` (modified/staged/untracked files), `git.diff` (diff output, optional --staged), `git.commit` (input: message, files[]; stages files, commits with conventional format). All validate cwd within workspace. git.commit checks dirty workspace policy — if unrelated uncommitted changes exist, return error requesting human instruction. Use `simple-git`. Write unit tests with temp git repo fixture. Acceptance: status/diff read-only, commit enforces conventions, dirty workspace detected.

### PHASE-3.7 — Implement test.run tool
Agent: @BE
Prompt: Create `apps/core/src/tools/test-run.tool.ts`. Input: `{ command?, testPath?, timeout? }`. Default command = `npm test` or detect from package.json. Execute in project workspace with timeout (default 300s). Parse exit code (0=pass, non-zero=fail). Capture stdout/stderr. Return `{ passed, exitCode, stdout, stderr, timedOut }`. Write unit tests. Acceptance: tests run, results captured, timeout enforced.

### PHASE-3.8 — Implement lint.run tool
Agent: @BE
Prompt: Create `apps/core/src/tools/lint-run.tool.ts`. Input: `{ command?, fix? }`. Default command = `npm run lint`. If fix=true append `-- --fix`. Execute with 120s timeout. Return `{ passed, exitCode, stdout, stderr }`. Write unit tests. Acceptance: lint runs, fix mode works, timeout enforced.

### PHASE-3.9 — Implement tool approval flow
Agent: @BE
Prompt: Create `apps/core/src/tools/tool-approval.service.ts`. Before executing any tool call: 1) check tool risk_level (safe/controlled/high-risk per spec Section 29.7), 2) check agent's capability policy (allowed_tools, approval_required_tools), 3) if approval required: pause execution, create Approval record, notify via Telegram with command preview, wait for /approve or /reject, 4) if approved: execute, 5) if rejected: return rejection to agent. Integrate with approval_gate_node. Write unit tests for each risk level path. Acceptance: safe tools auto-execute, controlled tools per policy, high-risk always requires approval.

### PHASE-3.10 — Implement tool sandboxing (workspace restriction)
Agent: @SEC
Prompt: Create `apps/core/src/tools/sandbox.service.ts` implementing mandatory protections from spec Section 27.5. Enforce: all tool paths resolved against project root, path traversal detection (reject `..`, symlinks outside workspace), working-directory restriction, command timeout, process kill on timeout, max stdout/stderr capture (1MB), risky-command pattern matching, all tool calls logged to tool_calls table. Windows-specific: track spawned PIDs, orphan cleanup on worker shutdown, handle PowerShell execution policy failures. Write security-focused unit tests. Acceptance: all protections enforced, traversal/symlink attacks blocked.

### PHASE-3.11 — Implement QA runtime validation node
Agent: @BE
Prompt: Create `apps/core/src/workflow/nodes/qa-runtime-validation.node.ts`. This LangGraph node: 1) runs TypeScript compile check (`npx tsc --noEmit`) in project workspace, 2) runs lint check, 3) attempts application start (verify no crash within 5s), 4) collects results, 5) returns `{ passed, checks: Array<{name, passed, output}> }`. If mandatory check fails, route back to worker for repair. Write unit tests with mocked tool executions. Acceptance: all checks run, failures trigger repair cycle.

### PHASE-3.12 — Implement QA unit test validation node
Agent: @BE
Prompt: Create `apps/core/src/workflow/nodes/qa-unit-test.node.ts`. This LangGraph node: 1) runs test.run tool in project workspace, 2) parses test results (pass/fail count), 3) checks 100% test pass rate requirement, 4) returns `{ passed, totalTests, passedTests, failedTests, coverage? }`. If tests fail, include failure details in state for worker repair cycle. Write unit tests. Acceptance: test results parsed, 100% pass enforced, failures route to repair.

### PHASE-3.13 — Implement cross-platform runtime layer
Agent: @BE
Prompt: Create `apps/core/src/platform/` module with PlatformService. Implement: `detectOS()` returning {os, shell, pathSeparator}, `normalizePath(path)` handling Windows/macOS differences, `getShellCommand(cmd)` wrapping for correct shell, `getProjectContext(projectPath)` returning OS/shell/packageManager info for agent prompts. Use `node:os`, `node:path`, `cross-spawn`. Default to Windows (PowerShell). Write unit tests mocking different OS environments. Acceptance: OS detected, paths normalized, shell commands wrapped correctly.

### PHASE-3.14 — End-to-end tool execution test
Agent: @QA
Prompt: Write integration test `apps/core/test/e2e/tool-execution.e2e-spec.ts` that: 1) creates temp project directory with simple Node.js project, 2) executes filesystem.read, 3) executes filesystem.write, 4) executes filesystem.patch, 5) executes shell.execute (`echo hello`), 6) executes git.status, 7) executes test.run, 8) verifies all tool_calls records persisted, 9) verifies sandbox rejects path traversal. Clean up temp directory. Acceptance: all tools execute correctly, records persisted, security enforced.


---

## Phase 4 — Neural Pipeline Dashboard

### PHASE-4.1 — WebSocket/SSE real-time events
Agent: @BE
Prompt: Create `apps/core/src/events/` module with EventsModule and EventsGateway (NestJS WebSocket gateway using `@nestjs/websockets` + `socket.io`). Implement event emission for: workflow_status_changed, node_started, node_completed, node_failed, approval_requested, task_completed. Each event payload: workflow_run_id, task_id, node_name, status, timestamp. Create EventEmitterService for other services to broadcast. Protect WebSocket with auth token on connection. Write unit tests. Acceptance: events emit in real-time, auth enforced on connection.

### PHASE-4.2 — React Flow pipeline visualization
Agent: @FE
Prompt: Create `apps/console/src/app/pipeline/page.tsx` and `apps/console/src/components/pipeline/` directory. Install `reactflow`. Build PipelineView component: fetch workflow run data from `GET /workflow-runs/:id/nodes`, render nodes as React Flow nodes with custom styling per status (pending=gray, running=blue pulse, success=green, failed=red, waiting_approval=yellow), render edges showing execution flow, subscribe to WebSocket for real-time updates. Create mock data for development. Style with Tailwind. Acceptance: pipeline renders, nodes colored by status, real-time updates work.

### PHASE-4.3 — Node status display
Agent: @FE
Prompt: Create `apps/console/src/components/pipeline/PipelineNode.tsx` custom React Flow node component. Display: node name, agent name (if assigned), status badge with color coding, duration timer (elapsed for running nodes), retry count badge (if > 0). Add animated border for running state. Add click handler to open detail drawer. Tailwind styling. Write component tests with React Testing Library. Acceptance: all status states render correctly, animation works, click opens drawer.

### PHASE-4.4 — Node detail drawer (logs, tokens, cost)
Agent: @FE
Prompt: Create `apps/console/src/components/pipeline/NodeDetailDrawer.tsx` — slide-out panel on node click. Fetch from `GET /workflow-runs/:id/nodes/:nodeId`. Display tabs: Overview (agent, model, provider, RTK/Caveman, duration, retry count), Logs (scrollable entries from GET /tasks/:id/logs), Tool Calls (list with command, status, stdout preview), Tokens & Cost (input/output tokens, estimated cost, model route), Artifacts (list with download links). Tailwind styling. Write component tests. Acceptance: drawer opens, all tabs render data, scrollable logs work.

### PHASE-4.5 — Approval queue dashboard
Agent: @FE
Prompt: Create `apps/console/src/app/approvals/page.tsx`. Fetch pending approvals from `GET /approvals?status=pending`. Display table: Task ID, Action Required, Agent, Risk Level, Requested At, Time Remaining (countdown from timeout_at). Add Approve/Reject buttons calling `POST /approvals/:id/approve` or `/reject`. Show toast on action. Subscribe to WebSocket for new approvals. Tailwind styling. Acceptance: approvals listed, buttons work, real-time updates, countdown timer.

### PHASE-4.6 — Project overview page
Agent: @FE
Prompt: Create `apps/console/src/app/projects/page.tsx` (list) and `apps/console/src/app/projects/[id]/page.tsx` (detail). List: fetch `GET /projects`, display cards with name, path, last_used_at, task count. Detail: project metadata, recent tasks, active workflows, quick stats (total/completed/failed tasks), link to Kanban and analytics. Add "Add Project" button with modal (path input + validation). Tailwind styling. Acceptance: projects listed, detail page renders, add project works.

### PHASE-4.7 — Tasks list page
Agent: @FE
Prompt: Create `apps/console/src/app/tasks/page.tsx`. Fetch `GET /tasks` with pagination (page, pageSize). Display table: ID, Prompt (truncated), Status (color badge), Project, Execution Mode, Created At, Duration. Add status filter dropdown. Click navigates to task detail showing full prompt, agent runs, tool calls, logs, pipeline link. Tailwind styling. Acceptance: table renders, pagination works, filter works, navigation works.

### PHASE-4.8 — Agents list page
Agent: @FE
Prompt: Create `apps/console/src/app/agents/page.tsx`. Fetch `GET /agents`. Display cards per agent: name, role, status (active/idle/temporary), total runs, success rate, total tokens, default model. For temporary agents show expiry info. Add detail view with agent profile, capability policy, recent runs, performance metrics. Tailwind styling. Acceptance: agents listed, detail view works, temporary agents show expiry.

### PHASE-4.9 — Usage/analytics page
Agent: @FE
Prompt: Create `apps/console/src/app/analytics/page.tsx`. Install `recharts`. Fetch from `GET /usage/models`, `GET /usage/tokens`, `GET /usage/costs`. Display: total tokens line chart (input vs output over time), cost breakdown bar chart (by model/provider), model usage pie chart, task completion rate (success vs failed over time), summary cards (total tasks, total cost, avg duration, active agents). Add date range filter. Tailwind styling. Acceptance: all charts render, date filter works, data accurate.

### PHASE-4.10 — Project Kanban view
Agent: @FE
Prompt: Create `apps/console/src/app/projects/[id]/kanban/page.tsx`. Fetch `GET /projects/:id/kanban`. Render drag-and-drop Kanban board with columns: Backlog, To Do, In Progress, QA Review, Done, Failed, Blocked. Cards show: task title (60 chars), task ID, assigned agent, status badge. Drag-to-move calls `PATCH /tasks/:id` to update status. Use `@dnd-kit/core`. Subscribe to WebSocket for real-time card updates. Tailwind styling. Acceptance: board renders, drag works, API called on move, real-time updates.


---

## Phase 5 — Multi-Agent Collaboration

### PHASE-5.1 — Agent registry service
Agent: @BE
Prompt: Create `apps/core/src/agents/` module with AgentsModule, AgentsService, AgentsController. Implement: `GET /agents` (list all with status), `GET /agents/:id` (detail), `PATCH /agents/:id/config` (update capability policy). AgentsService manages profiles in new Prisma Agent model (id, name, role, status, agent_type=founding|specialist|temporary, capability_policy JSON, default_model_tier, created_at, expires_after_task). Seed founding agents (PO, PM) on first run. Write unit tests. Acceptance: CRUD works, founding agents seeded, capability policy updatable.

### PHASE-5.2 — Dynamic agent creation protocol
Agent: @BE
Prompt: Create `apps/core/src/agents/dynamic-agent.service.ts`. Implement `requestDynamicAgent(request)` that: 1) validates metadata (agent_name, role, reason_needed, allowed_tools, scope, permanent_or_temporary), 2) evaluates auto-approve conditions (temporary, scoped, low-risk tools, within budget), 3) if auto-approved: create Agent record status=active expires_after_task=true, 4) if human approval needed: create approval request, pause workflow, notify Telegram, 5) enforce max_dynamic_agents_per_workflow=3 and depth_limit=1. Add approve/reject endpoints. Write unit tests for both paths. Acceptance: auto-approve works, human approval works, limits enforced.

### PHASE-5.3 — Agent communication protocol (messages)
Agent: @BE
Prompt: Create `apps/core/src/messages/` module with MessagesService. Implement `send(from_agent, to_agent_or_channel, message_type, payload, task_id, project_id)` persisting to AgentMessage table. Implement `getMessages(filters: {task_id?, agent?, channel?, since?})`. Message types: delegation, status_update, artifact_reference, review_request, review_result, escalation. All messages logged and queryable. Prefer artifact references over large payloads. Write unit tests. Acceptance: messages persist, queryable by filters, types enforced.

### PHASE-5.4 — Artifact registry implementation
Agent: @BE
Prompt: Create `apps/core/src/artifacts/` module with ArtifactsService. Implement: `create(taskId, agentRunId, type, content, relativePath)` that writes to `<project>/.schitzo/artifacts/<taskId>/<filename>`, computes SHA-256 checksum, persists Artifact metadata (never overwrite — new version if path exists), returns artifact_id. Implement `get(id)`, `listByTask(taskId)`, `getContent(id)`. Types: patch, snapshot, markdown, diagram, test_report, log. Write unit tests verifying immutable versioning. Acceptance: artifacts stored, versioned, checksummed, never overwritten.

### PHASE-5.5 — Parallel execution with file-scope locking
Agent: @BE
Prompt: Create `apps/core/src/workflow/file-lock.service.ts`. Implement: `acquireLock(workflowRunId, agentName, filePaths[])` registering exclusive write locks in Redis with TTL, `releaseLock(workflowRunId, agentName, filePaths[])`, `checkConflict(filePaths[])` returning conflicting locks. Before parallel execution, Agent Lead calls acquireLock per agent's file scope. Conflict forces sequential execution. Write unit tests for acquisition, conflict detection, TTL expiry. Acceptance: locks acquired, conflicts detected, TTL expires correctly.

### PHASE-5.6 — GitHub issue/board sync service
Agent: @BE
Prompt: Create `apps/core/src/sync/github-sync.service.ts`. Implement: `createIssue(task)` using Octokit (title=prompt truncated, body=details, labels=[phase, type]), `updateIssueStatus(task)` syncing status changes, `syncBoardItem(task)` moving project board item to matching column. Idempotency key=task_id prevents duplicates. Store github_issue_id and github_project_item_id on Task record. Handle API errors gracefully. Write unit tests with mocked Octokit. Acceptance: issues created, board synced, idempotent on retry.

### PHASE-5.7 — Hermes Kanban sync service
Agent: @BE
Prompt: Create `apps/core/src/sync/hermes-kanban-sync.service.ts`. Implement: `createCard(task, projectId)` creating Kanban card, `updateCardStatus(task)` moving card to matching column (Backlog/To Do/In Progress/QA Review/Done/Failed/Blocked), `getBoard(projectId)` returning board state. Store hermes_kanban_card_id on Task. Idempotency key=task_id. Log sync warnings on divergence. Write unit tests. Acceptance: cards created, moved on status change, divergence logged.

### PHASE-5.8 — Reviewer agent node
Agent: @BE
Prompt: Create `apps/core/src/workflow/nodes/reviewer.node.ts`. This LangGraph node: 1) receives completed worker output and QA results, 2) invokes Hermes with Reviewer agent profile (code review focus), 3) evaluates: code quality, adherence to requirements, test coverage, potential issues, 4) returns `{ approved, feedback, issues: Array<{severity, description, file, line?}> }`. If not approved, route back to worker with feedback. If approved, proceed to final_response_node. Write unit tests. Acceptance: review executes, approval/rejection routes correctly.

### PHASE-5.9 — Worker agent node (specialist execution)
Agent: @BE
Prompt: Create `apps/core/src/workflow/nodes/worker-agent.node.ts`. This LangGraph node: 1) receives delegation plan from agent_lead_node (agent profile, task subset, allowed tools, file scope), 2) invokes HermesService.execute() with specialist profile, 3) processes tool_calls through ToolExecutionService (respecting sandbox, approval flow), 4) collects results (files modified, tests run, artifacts created), 5) returns updated state. Support sequential multi-step tool execution within single worker turn. Write unit tests. Acceptance: worker executes tools, results collected, sandbox enforced.

### PHASE-5.10 — Agent Lead delegation logic
Agent: @BE
Prompt: Enhance `apps/core/src/workflow/nodes/agent-lead.node.ts` with full delegation: 1) analyze task complexity (simple/medium/complex/critical), 2) consult agent registry for available specialists, 3) if no suitable agent, request dynamic creation, 4) assign file scopes to avoid conflicts, 5) decide sequential vs parallel, 6) for parallel: define independent work units with non-overlapping file scopes, 7) return delegation_plan: agents[], execution_order, file_scopes per agent, model_tier per agent. Write unit tests for each scenario. Acceptance: delegation logic handles all complexity levels, parallel/sequential decided correctly.

### PHASE-5.11 — End-to-end multi-agent test
Agent: @QA
Prompt: Write integration test `apps/core/test/e2e/multi-agent.e2e-spec.ts` validating: 1) task submitted, 2) Agent Lead delegates to 2 specialists (Backend + QA), 3) Backend agent executes file write + git commit (mocked), 4) QA agent runs tests (mocked pass), 5) Reviewer approves, 6) GitHub issue created and synced, 7) Kanban card moved to Done, 8) all agent_messages logged, 9) artifacts persisted, 10) file locks acquired and released. Mock all external services. Acceptance: full multi-agent flow passes end-to-end.


---

## Phase 6 — Compare Mode / Neural Arena MVP

### PHASE-6.1 — Compare mode workflow
Agent: @BE
Prompt: Create `apps/core/src/workflow/compare-mode.graph.ts` — LangGraph graph variant for Compare Mode. When execution_mode=compare: 1) parse user request for candidate models (e.g., "Claude vs GPT"), 2) fork into parallel branches (one per candidate model), 3) each branch runs same task through worker_agent_node with different model_route, 4) collect results from all branches, 5) do NOT auto-apply any result, 6) pass all candidates to evaluator node. Trigger only on explicit `/compare` command or execution_mode=compare. Write unit tests with 2 mocked model branches. Acceptance: parallel branches execute, results collected, nothing auto-applied.

### PHASE-6.2 — Evaluator agent
Agent: @EVL
Prompt: Create `apps/core/src/workflow/nodes/evaluator.node.ts` and `docs/agents/evaluator.md`. Evaluator node: 1) receives all candidate results, 2) scores using weighted criteria: Test Result (40%), Implementation Quality (25%), Cost Efficiency (15%), Speed (10%), Maintainability (10%), 3) if tests fail, candidate cannot win unless all fail, 4) generates scoring explanation, 5) returns ranked candidates with scores and recommendation. Output sent to Telegram for human selection. Write unit tests verifying scoring logic and tie-breaking. Acceptance: scoring correct, tie-breaking works, explanation generated.

### PHASE-6.3 — Side-by-side result view
Agent: @FE
Prompt: Create `apps/console/src/app/compare/[runId]/page.tsx`. Fetch from `GET /workflow-runs/:id/compare-results`. Display side-by-side panels per candidate: model name, provider, code output (syntax highlighted), test results (pass/fail badge), token usage, estimated cost, duration, evaluator score with breakdown. Highlight recommended candidate. Add "Select Winner" button per candidate calling `POST /workflow-runs/:id/select-winner`. Tailwind split-pane layout. Acceptance: side-by-side renders, scores displayed, selection works.

### PHASE-6.4 — Telegram /compare and /choose commands
Agent: @BE
Prompt: In TelegramService, implement: 1) `/compare <prompt>` creating task with execution_mode=compare, parse model candidates from prompt (e.g., "Compare Claude vs GPT for fixing X"), default to configured comparison set if not specified, 2) when results ready, send summary per candidate: candidate_name, model_route, summary, pros, cons, estimated_cost, test_result, 3) `/choose <task_id> <candidate>` calling select-winner endpoint and applying chosen result. Write unit tests for command parsing and response formatting. Acceptance: /compare creates compare task, results summarized, /choose applies winner.

### PHASE-6.5 — Neural Arena dashboard page
Agent: @FE
Prompt: Create `apps/console/src/app/arena/page.tsx`. Display: list of all compare-mode runs with status and winner, aggregate stats (model win rates, avg scores per model, cost comparison chart), click-through to individual compare result pages. Add filters by date range, models involved, project. Use Recharts (bar chart win rates, radar chart score dimensions). Tailwind styling. Acceptance: arena page renders, stats accurate, filters work, charts display.

### PHASE-6.6 — Compare mode persistence
Agent: @BE
Prompt: Create Prisma models: CompareRun (id, workflow_run_id, task_id, status, winner_candidate_id, selected_by, selected_at) and CompareCandidate (id, compare_run_id, model_name, provider_route, result_summary, code_output_artifact_id, test_passed, score_total, score_breakdown JSON, input_tokens, output_tokens, estimated_cost, duration_ms). Implement CompareService with createRun, addCandidate, selectWinner, getResults. Rejected candidates cleaned up after workflow completion per spec Section 30.6. Generate migration. Write unit tests. Acceptance: models created, CRUD works, cleanup executes.


---

## Phase 7 — Smart Model Optimization

### PHASE-7.1 — Task complexity classification
Agent: @BE
Prompt: Create `apps/core/src/tasks/complexity.service.ts`. Implement `classifyComplexity(task): 'simple'|'medium'|'complex'|'critical'` using heuristics: simple=single file or short prompt (<100 chars), medium=multiple files or moderate scope, complex=architecture/refactor keywords or many files, critical=production/security/deployment keywords. Store classification on Task record (difficulty field). Classification influences model selection and retry strategy. Write unit tests with example prompts for each level. Acceptance: classification correct for each level, stored on task.

### PHASE-7.2 — Model selection heuristics
Agent: @BE
Prompt: Create `apps/core/src/nine-router/model-selector.service.ts`. Implement `selectModel(taskType, complexity, budget?)` returning optimal model route per spec Section 29.5: summarization→cheap/fast, coding→coding-specialized, debugging→reasoning+coding, architecture→strongest reasoning. Map complexity to tiers (simple→small, medium→standard, complex/critical→strongest). Return `{ model, provider_route, tier, reason }`. Allow budget override for cheaper models. Write unit tests for each taskType × complexity combination. Acceptance: correct model selected per heuristic, budget override works.

### PHASE-7.3 — Budget modes
Agent: @BE
Prompt: Create `apps/core/src/usage/budget.service.ts`. Implement budget modes: economy (cheapest viable), balanced (default heuristic), performance (strongest). Add per-project and global budget limits (daily/monthly token cap, daily/monthly cost cap). Implement `checkBudget(projectId?)` returning remaining budget, `enforceBudget()` blocking new tasks if exceeded (notify via Telegram). Store config in new Prisma BudgetConfig model. Write unit tests. Acceptance: modes work, limits enforced, notification sent on exceed.

### PHASE-7.4 — Fallback routing
Agent: @BE
Prompt: Enhance NineRouterService with fallback logic per spec Section 30.12: on provider failure after max retries, attempt fallback: 1) stronger model same provider, 2) alternative cloud provider, 3) configured local model. Implement FallbackChain configuration (DB or config). Log each fallback attempt. Escalation only once unless human approves. Add `GET /usage/provider-health` showing recent success/failure rates. Write unit tests simulating failures and fallback chain. Acceptance: fallback chain executes in order, single escalation enforced.

### PHASE-7.5 — Provider health status
Agent: @BE
Prompt: Create `apps/core/src/nine-router/provider-health.service.ts`. Track per-provider: success_count, failure_count, avg_latency_ms, last_failure_at, consecutive_failures. Update on every NineRouterService call. Implement `getHealth()` returning providers with status (healthy/degraded/down based on consecutive_failures threshold). Expose via `GET /usage/provider-health`. If provider down, model-selector prefers alternatives. Store in Redis, periodic PostgreSQL persistence. Write unit tests. Acceptance: health tracked, status computed, down providers deprioritized.

### PHASE-7.6 — Model escalation policy
Agent: @BE
Prompt: Implement model escalation in workflow retry logic: when worker repair cycles fail with current model, escalate once to next tier. Configure escalation mapping in `apps/core/src/nine-router/escalation.config.ts` as tier ladder. Log escalation events. After max_model_escalations=1, mark task failed/blocked. Store `escalation_used: boolean` on AgentRun record. Write unit tests verifying single escalation and failure after max. Acceptance: escalation triggers once, logged, failure after max.

### PHASE-7.7 — Cost-aware selection
Agent: @BE
Prompt: Enhance ModelSelectorService to factor real-time cost: 1) estimate task token usage from complexity and historical averages, 2) calculate projected cost per candidate model using ModelPricing table, 3) if projected cost exceeds task/project budget, downgrade to cheaper model, 4) log cost-aware decisions. Add `estimated_cost_before` field to AgentRun for pre-execution estimates. Write unit tests comparing selection with/without budget constraints. Acceptance: cost-aware downgrade works, estimates logged.


---

## Phase 8 — Advanced Automation

### PHASE-8.1 — Browser automation tools
Agent: @BE
Prompt: Create `apps/core/src/tools/browser.tool.ts` with sub-tools: `browser.open(url)`, `browser.click(selector)`, `browser.screenshot(path?)`, `browser.extract(selector)`. Use Playwright as browser engine. All actions in sandboxed context (no filesystem access outside artifacts). Screenshots saved as artifacts. 30s timeout per action. Require approval for non-localhost URLs. Write unit tests with Playwright test fixtures. Acceptance: browser tools work, sandbox enforced, approval for external URLs.

### PHASE-8.2 — Android emulator tools
Agent: @BE
Prompt: Create `apps/core/src/tools/emulator.tool.ts` with sub-tools: `emulator.start(avdName)`, `emulator.install_apk(path)`, `emulator.run_test(command)`, `emulator.screenshot(path?)`. Use ADB commands via shell.execute internally. Validate APK path within workspace. 60s timeout for start, 300s for tests. Outputs as artifacts. Require approval for first use per session. Write unit tests (mock ADB). Acceptance: emulator tools work, timeouts enforced, approval required.

### PHASE-8.3 — GitHub PR creation
Agent: @BE
Prompt: Create `apps/core/src/tools/github-pr.tool.ts`. Implement `github.create_pr({ title, body, head_branch, base_branch?, labels?, reviewers? })` using Octokit. Default base_branch=develop. Title: prompt truncated to 70 chars. Body: task ID, changes summary, test results, agent name. Idempotency check (PR exists for branch?). Store PR URL on task. Require approval (high-risk). Write unit tests with mocked Octokit. Acceptance: PR created, idempotent, approval required.

### PHASE-8.4 — CI/CD workflow integration
Agent: @OPS
Prompt: Create `apps/core/src/tools/ci-cd.tool.ts`. Implement: `ci.trigger(workflow_name, branch?)` triggering GitHub Actions via API, `ci.status(run_id)` checking status, `ci.logs(run_id)` fetching logs. Poll for completion with 10min timeout. Return `{ status, conclusion, logs_url, duration }`. After PR creation, optionally trigger CI and wait for green. Write unit tests with mocked GitHub API. Acceptance: CI triggers, status polled, timeout works.

### PHASE-8.5 — Deployment approval gates
Agent: @SEC
Prompt: Create `apps/core/src/workflow/nodes/deployment-gate.node.ts`. Activates when task involves deployment (keywords or explicit flag). Behavior: 1) always require human approval via Telegram regardless of autonomy level, 2) show deployment target, changes summary, test results, risk assessment, 3) wait for /approve with 24h timeout, 4) on approval: proceed to deployment, 5) on reject/timeout: mark blocked. Log all decisions. Write unit tests. Acceptance: deployment always gated, approval/rejection/timeout handled.

### PHASE-8.6 — package.install tool
Agent: @BE
Prompt: Create `apps/core/src/tools/package-install.tool.ts`. Input: `{ packages: string[], dev?, exact? }`. Validate package names (reject suspicious/typosquatting patterns). Run `npm install [--save-dev] [--save-exact] <packages>` in workspace. Run `npm audit` after install, log vulnerabilities. Return `{ installed, vulnerabilities, lockfileUpdated }`. Risk level: controlled (auto-approved in semi_autonomous). Write unit tests. Acceptance: packages install, audit runs, suspicious names rejected.

### PHASE-8.7 — End-to-end automation test
Agent: @QA
Prompt: Write integration test `apps/core/test/e2e/automation.e2e-spec.ts` validating: 1) package.install adds dependency to temp project, 2) github.create_pr creates PR (mocked API), 3) ci.trigger starts workflow (mocked), 4) deployment gate pauses for approval, 5) approval resumes execution. Test browser tools separately with Playwright test server. Verify tool_calls logged, approvals tracked, artifacts created. Clean up temp resources. Acceptance: all automation tools tested end-to-end.


---

## Phase 9 — Production Hardening

### PHASE-9.1 — Full RBAC implementation
Agent: @SEC
Prompt: Create `apps/core/src/auth/rbac/` with RbacModule, RolesGuard, PermissionsGuard. Define roles: admin, operator, viewer. Define permissions per resource (tasks, projects, agents, approvals, settings). Implement `@Roles('admin')` and `@Permissions('tasks.create')` decorators. Store roles in User model. Admin=all, operator=create/execute tasks, viewer=read-only. Protect all endpoints. Write unit tests for each role × resource combination. Acceptance: RBAC enforced on all endpoints, roles work correctly.

### PHASE-9.2 — Expanded audit logs
Agent: @SEC
Prompt: Create `apps/core/src/audit/` module with AuditService. Log all state-changing operations: task creation, status changes, approvals, agent creation, config changes, auth events, tool executions. Store in new AuditLog Prisma model (id, user_id, action, resource_type, resource_id, old_value, new_value, ip_address, timestamp). Implement `GET /audit-logs` with filters (action, resource, date range, user). Append-only (no update/delete). Write unit tests. Acceptance: all state changes logged, queryable, immutable.

### PHASE-9.3 — Workspace isolation improvements
Agent: @SEC
Prompt: Harden SandboxService: 1) symlink resolution and rejection if target outside workspace, 2) filesystem watcher for escape attempts, 3) process tree tracking (kill entire tree on timeout), 4) network namespace isolation where OS supports, 5) resource limits (max file size write=10MB, max files per task=100). Write security tests: symlink attacks, process fork bombs, resource exhaustion. Acceptance: all attack vectors blocked, limits enforced.

### PHASE-9.4 — Encrypted secrets management
Agent: @SEC
Prompt: Create `apps/core/src/secrets/` module with SecretsService. Implement: 1) encrypt sensitive values at rest using AES-256-GCM with master key from env, 2) `store(key, value)` encrypts and persists, 3) `retrieve(key)` decrypts and returns, 4) mask secrets in all log outputs (replace with `***`), 5) never expose in Telegram/artifacts/API, 6) agents access only secrets in their capability policy. New Prisma Secret model. Write unit tests verifying encryption, masking, access control. Acceptance: secrets encrypted at rest, masked in logs, access controlled.

### PHASE-9.5 — Backup/restore
Agent: @OPS
Prompt: Create `apps/core/src/maintenance/backup.service.ts`. Implement: `createBackup()` dumping PostgreSQL to `backups/<timestamp>.sql.gz` (pg_dump), copies critical config, creates manifest JSON. `restoreBackup(backupId)` validates manifest, restores DB and config. Add `POST /maintenance/backup` and `POST /maintenance/restore/:id` (admin only). Schedule daily backup via BullMQ recurring job. Retain last 7 daily. Write unit tests with test database. Acceptance: backup creates, restore works, scheduled daily, retention enforced.

### PHASE-9.6 — Crash recovery hardening
Agent: @BE
Prompt: Implement crash recovery on worker startup: 1) query WorkflowRun records status=running, 2) for each: check checkpoint → attempt resume, 3) if no checkpoint or resume fails: mark retrying (if retries remain) or blocked, 4) log recovery actions, 5) notify user via Telegram of recovered/blocked workflows. Implement PM2 graceful shutdown hook: on SIGTERM, complete current node, checkpoint, exit. Write integration tests simulating crash and restart. Acceptance: orphaned workflows recovered, graceful shutdown works.

### PHASE-9.7 — Provider failover hardening
Agent: @BE
Prompt: Enhance ProviderHealthService with: 1) circuit breaker pattern (open after 5 consecutive failures, half-open after 60s, close on success), 2) automatic provider exclusion when circuit open, 3) health check ping per provider (if available), 4) Telegram notification on provider down/recovery, 5) dashboard provider status widget. Store circuit state in Redis. Write unit tests for circuit breaker transitions and recovery. Acceptance: circuit breaker works, notifications sent, dashboard shows status.

### PHASE-9.8 — Retention/cleanup jobs
Agent: @OPS
Prompt: Create `apps/core/src/maintenance/cleanup.service.ts`. Daily BullMQ recurring job: 1) delete workflow logs > 30 days (failed: 60 days), 2) remove stale Redis queue records, 3) clean `.schitzo/tmp/` files, 4) remove abandoned checkpoints (cancelled/failed > 7 days), 5) archive completed workflows > 90 days (status=archived). Log cleanup stats. Add `GET /maintenance/cleanup-status`. Write unit tests. Acceptance: cleanup runs daily, retention policies enforced, stats logged.

### PHASE-9.9 — Observability (structured logging)
Agent: @OPS
Prompt: Replace console.log with structured JSON logging using `pino` or `nestjs-pino`. Every log entry: timestamp, level, correlation_id (workflow_run_id or task_id), service, message, metadata. Implement request-scoped correlation ID via NestJS interceptor. Log level configurable via env. Integrate with SecretsService masking (secrets never logged). Write unit tests verifying log structure and secret masking. Acceptance: all logs structured JSON, correlation IDs present, secrets masked.

### PHASE-9.10 — Global analytics dashboard
Agent: @FE
Prompt: Create `apps/console/src/app/analytics/global/page.tsx`. Display: total tasks (all time + 7d/30d), completion rate, failure rate, total cost, cost trend (line chart), model usage distribution (pie), provider reliability (bar chart), agent performance (table: agent, tasks, success rate, avg duration), top errors (table), active workflows count. Date range selector. Fetch from `/usage/*` endpoints. Auto-refresh 30s. Tailwind + Recharts. Acceptance: all metrics render, auto-refresh works, date filter works.

### PHASE-9.11 — Per-project analytics
Agent: @FE
Prompt: Create `apps/console/src/app/projects/[id]/analytics/page.tsx`. Display: tasks by status (stacked bar), cost over time (line), model usage for project (pie), agent activity (timeline), test pass rate trend (line), avg task duration trend, most modified files (table), recent failures with error types. Fetch from `GET /usage/projects/:id`. Comparison toggle to overlay global averages. Tailwind + Recharts. Acceptance: project-scoped metrics accurate, comparison toggle works.

### PHASE-9.12 — Final production readiness audit
Agent: @REV
Prompt: Conduct full production readiness review. Verify: 1) all endpoints have auth guards, 2) all tool executions sandboxed, 3) all secrets encrypted and masked, 4) audit logs cover all state changes, 5) RBAC enforced consistently, 6) error handling returns safe messages (no stack traces), 7) rate limiting on public endpoints, 8) CORS configured, 9) database has proper indexes, 10) PM2 config production-ready, 11) .env.example complete, 12) README documents production deployment. Write findings to `docs/audit/production-readiness.md` with pass/fail per item and remediation notes. Acceptance: audit document complete, all items assessed.
