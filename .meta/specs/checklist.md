# Schitzo NeuralOS — Task Checklist

## Phase 0 — Project Foundation
- [x] PHASE-0.1 — Initialize GitHub repository
- [x] PHASE-0.2 — Setup GitHub project board
- [x] PHASE-0.3 — Setup issue and PR templates
- [x] PHASE-0.4 — Setup monorepo workspace (npm workspaces)
- [x] PHASE-0.5 — Setup NestJS Schitzo Core backend
- [x] PHASE-0.6 — Setup Next.js Neural Console dashboard
- [x] PHASE-0.7 — Setup shared TypeScript packages
- [x] PHASE-0.8 — Setup ESLint and Prettier
- [x] PHASE-0.8b — Setup Husky + Commitlint
- [x] PHASE-0.9 — Setup Vitest and CI baseline
- [x] PHASE-0.10 — Setup local environment files
- [x] PHASE-0.11 — Setup early authentication baseline
- [x] PHASE-0.12 — Setup Prisma schema and migrations
- [x] PHASE-0.13 — Define Product Owner Agent profile
- [x] PHASE-0.14 — Define Project Manager Agent profile
- [x] PHASE-0.15 — Define Agent Creation Protocol
- [x] PHASE-0.16 — Document local developer workflow
- [x] PHASE-0.17 — Analyze Phase 1 agent requirements

## Phase 1 — Basic Control Loop
- [ ] PHASE-1.1 — Implement Telegram bot webhook integration
- [ ] PHASE-1.2 — Implement task intake service
- [ ] PHASE-1.3 — Implement 9Router integration
- [ ] PHASE-1.4 — Implement BullMQ job queue
- [ ] PHASE-1.5 — Implement basic model call via 9Router
- [ ] PHASE-1.6 — Implement Telegram response service
- [ ] PHASE-1.7 — Implement task status tracking
- [ ] PHASE-1.8 — Implement basic task logs
- [ ] PHASE-1.9 — Implement /status command
- [ ] PHASE-1.10 — End-to-end control loop test
- [ ] PHASE-1.11 — Implement Schitzo CLI interactive terminal client
- [ ] PHASE-1.12 — CLI → Schitzo Core integration (task submission + status)

## Phase 2 — LangGraph Pipeline Foundation
- [ ] PHASE-2.1 — LangGraph JS integration setup
- [ ] PHASE-2.2 — Workflow run creation service
- [ ] PHASE-2.3 — Implement agent_lead_node
- [ ] PHASE-2.4 — Implement task state transitions
- [ ] PHASE-2.5 — Implement workflow state machine
- [ ] PHASE-2.6 — Implement basic retry support
- [ ] PHASE-2.7 — Implement final_response_node
- [ ] PHASE-2.8 — Implement approval_gate_node
- [ ] PHASE-2.9 — Implement workflow cancellation
- [ ] PHASE-2.10 — Implement checkpointing
- [ ] PHASE-2.11 — Implement worker process (BullMQ consumer)
- [ ] PHASE-2.12 — End-to-end pipeline test

## Phase 3 — Hermes Runtime + Tool Execution
- [ ] PHASE-3.1 — Hermes runtime integration
- [ ] PHASE-3.2 — Implement filesystem.read tool
- [ ] PHASE-3.3 — Implement filesystem.write tool
- [ ] PHASE-3.4 — Implement filesystem.patch tool
- [ ] PHASE-3.5 — Implement shell.execute tool
- [ ] PHASE-3.6 — Implement git tools (status, diff, commit)
- [ ] PHASE-3.7 — Implement test.run tool
- [ ] PHASE-3.8 — Implement lint.run tool
- [ ] PHASE-3.9 — Implement tool approval flow
- [ ] PHASE-3.10 — Implement tool sandboxing (workspace restriction)
- [ ] PHASE-3.11 — Implement QA runtime validation node
- [ ] PHASE-3.12 — Implement QA unit test validation node
- [ ] PHASE-3.13 — Implement cross-platform runtime layer
- [ ] PHASE-3.14 — End-to-end tool execution test

## Phase 4 — Neural Pipeline Dashboard
- [ ] PHASE-4.1 — WebSocket/SSE real-time events
- [ ] PHASE-4.2 — React Flow pipeline visualization
- [ ] PHASE-4.3 — Node status display
- [ ] PHASE-4.4 — Node detail drawer (logs, tokens, cost)
- [ ] PHASE-4.5 — Approval queue dashboard
- [ ] PHASE-4.6 — Project overview page
- [ ] PHASE-4.7 — Tasks list page
- [ ] PHASE-4.8 — Agents list page
- [ ] PHASE-4.9 — Usage/analytics page
- [ ] PHASE-4.10 — Project Kanban view

## Phase 5 — Multi-Agent Collaboration
- [ ] PHASE-5.1 — Agent registry service
- [ ] PHASE-5.2 — Dynamic agent creation protocol
- [ ] PHASE-5.3 — Agent communication protocol (messages)
- [ ] PHASE-5.4 — Artifact registry implementation
- [ ] PHASE-5.5 — Parallel execution with file-scope locking
- [ ] PHASE-5.6 — GitHub issue/board sync service
- [ ] PHASE-5.7 — Hermes Kanban sync service
- [ ] PHASE-5.8 — Reviewer agent node
- [ ] PHASE-5.9 — Worker agent node (specialist execution)
- [ ] PHASE-5.10 — Agent Lead delegation logic
- [ ] PHASE-5.11 — End-to-end multi-agent test

## Phase 6 — Compare Mode / Neural Arena MVP
- [ ] PHASE-6.1 — Compare mode workflow
- [ ] PHASE-6.2 — Evaluator agent
- [ ] PHASE-6.3 — Side-by-side result view
- [ ] PHASE-6.4 — Telegram /compare and /choose commands
- [ ] PHASE-6.5 — Neural Arena dashboard page
- [ ] PHASE-6.6 — Compare mode persistence

## Phase 7 — Smart Model Optimization
- [ ] PHASE-7.1 — Task complexity classification
- [ ] PHASE-7.2 — Model selection heuristics
- [ ] PHASE-7.3 — Budget modes
- [ ] PHASE-7.4 — Fallback routing
- [ ] PHASE-7.5 — Provider health status
- [ ] PHASE-7.6 — Model escalation policy
- [ ] PHASE-7.7 — Cost-aware selection

## Phase 8 — Advanced Automation
- [ ] PHASE-8.1 — Browser automation tools
- [ ] PHASE-8.2 — Android emulator tools
- [ ] PHASE-8.3 — GitHub PR creation
- [ ] PHASE-8.4 — CI/CD workflow integration
- [ ] PHASE-8.5 — Deployment approval gates
- [ ] PHASE-8.6 — package.install tool
- [ ] PHASE-8.7 — End-to-end automation test

## Phase 9 — Production Hardening
- [ ] PHASE-9.1 — Full RBAC implementation
- [ ] PHASE-9.2 — Expanded audit logs
- [ ] PHASE-9.3 — Workspace isolation improvements
- [ ] PHASE-9.4 — Encrypted secrets management
- [ ] PHASE-9.5 — Backup/restore
- [ ] PHASE-9.6 — Crash recovery hardening
- [ ] PHASE-9.7 — Provider failover hardening
- [ ] PHASE-9.8 — Retention/cleanup jobs
- [ ] PHASE-9.9 — Observability (structured logging)
- [ ] PHASE-9.10 — Global analytics dashboard
- [ ] PHASE-9.11 — Per-project analytics
- [ ] PHASE-9.12 — Final production readiness audit
