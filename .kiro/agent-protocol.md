# Agent Protocol — Schitzo NeuralOS

## Overview

When kiro-cli runs in this project, the `schitzo` agent loads automatically as the workspace default. It implements an **@mention routing protocol** that spawns specialized subagents on demand.

## Usage

```text
@PM <task>        → spawns Project Manager subagent
@PO <task>        → spawns Product Owner subagent
@ARC <task>       → spawns Architect subagent
@BE <task>        → spawns Backend subagent
@QA <task>        → spawns QA subagent
@REV <task>       → spawns Reviewer subagent
@FE <task>        → spawns Frontend subagent
@SEC <task>       → spawns Security subagent
@OPS <task>       → spawns DevOps subagent
@EVL <task>       → spawns Evaluator subagent
@TW <task>        → spawns Technical Writer subagent
<task> (no @)     → handled directly by orchestrator
```

## Examples

```text
@PM create tickets for Phase 0 setup
@PO review scope for Telegram integration
@ARC define integration contract for Core ↔ Worker
@BE implement the task queue service
@QA validate the auth module deliverable
@REV review PR #42
@FE build the pipeline visualization page
@SEC audit tool sandboxing boundaries
@OPS set up GitHub Actions CI pipeline
@EVL score Compare Mode candidates
```

## Mandatory Ticket-First Rule

**Every implementation task — regardless of source (CLI, Telegram, or Neural Console) — MUST have a GitHub issue created by @PM before any work begins.**

No exceptions. The orchestrator must spawn @PM to create the ticket before delegating to any implementation agent.

```text
Any source → @PM creates GitHub issue + board item → Task approved → Implementation starts
```

If a task is assigned directly (e.g., "implement X"), the orchestrator:
1. Spawns @PM to create the GitHub issue
2. Waits for ticket confirmation
3. Only then proceeds with implementation agents (@BE, @FE, @ARC, etc.)

## How It Works

1. User sends message with `@AGENT` mention
2. Orchestrator (`schitzo` agent) detects the mention
3. If the task involves implementation, orchestrator spawns @PM first (ticket-first rule)
4. Orchestrator spawns the named agent as a subagent via the `subagent` tool
5. Subagent executes with its own prompt, tools, and context
6. Results return to the orchestrator and are presented to the user

## Registered Agents

| Alias | Agent | File | Phase | Permanence |
|-------|-------|------|-------|------------|
| `@PO` | Product Owner | `.kiro/agents/PO.json` | Phase 0 | Permanent |
| `@PM` | Project Manager | `.kiro/agents/PM.json` | Phase 0 | Permanent |
| `@ARC` | Architect | `.kiro/agents/ARC.json` | Phase 0 | Permanent |
| `@BE` | Backend | `.kiro/agents/BE.json` | Phase 1 | Permanent |
| `@QA` | QA | `.kiro/agents/QA.json` | Phase 1 | Permanent |
| `@REV` | Reviewer | `.kiro/agents/REV.json` | Phase 2 | Permanent |
| `@FE` | Frontend / Dashboard | `.kiro/agents/FE.json` | Phase 4 | Permanent |
| `@SEC` | Security | `.kiro/agents/SEC.json` | Phase 3 | Permanent |
| `@OPS` | DevOps | `.kiro/agents/OPS.json` | Phase 5 | Temporary per task |
| `@EVL` | Evaluator | `.kiro/agents/EVL.json` | Phase 6 | Temporary per compare run |
| `@TW` | Technical Writer | `.kiro/agents/TW.json` | Phase 0 | Permanent |

## Keyboard Shortcuts

| Shortcut | Agent |
|----------|-------|
| `Ctrl+Shift+O` | @PO |
| `Ctrl+Shift+M` | @PM |
| `Ctrl+Shift+A` | @ARC |
| `Ctrl+Shift+B` | @BE |
| `Ctrl+Shift+Q` | @QA |
| `Ctrl+Shift+R` | @REV |
| `Ctrl+Shift+F` | @FE |
| `Ctrl+Shift+S` | @SEC |
| `Ctrl+Shift+D` | @OPS |
| `Ctrl+Shift+E` | @EVL |
| `Ctrl+Shift+T` | @TW |

## Adding New Agents

1. Create `<ALIAS>.json` in `.kiro/agents/`
2. Create `@<ALIAS>.md` documentation in `.kiro/agents/`
3. Add the alias to `schitzo.json` → `toolsSettings.crew.availableAgents`
4. Add routing instruction to `schitzo.json` prompt
5. Update this file's Registered Agents table

## Dependency Installation Protocol

After installing any new library, you MUST run `npm audit` and ensure it returns **0 vulnerabilities** before proceeding. If vulnerabilities are found:

1. Run `npm audit fix` to attempt automatic resolution.
2. If unresolved, try `npm audit fix --force` only if it doesn't break major versions.
3. If still unresolved, find an alternative package with no vulnerabilities.
4. Never proceed with implementation while vulnerabilities exist.

## Worker Agent Reference Documents

All implementation agents (@BE, @FE, @OPS, @SEC) MUST reference these documents before starting work:

| Document | Path | Purpose |
|----------|------|---------|
| Coding Standards | `.kiro/docs/standards/coding-standards.md` | Clean Architecture, module structure, naming |
| API Response Contract | `.kiro/docs/standards/api-response-contract.md` | Response envelope, status codes |
| Error Handling | `.kiro/docs/standards/error-handling.md` | Exceptions, logging, retry policy |
| Testing Standards | `.kiro/docs/standards/testing-standards.md` | Test patterns, mocking, coverage |
| Environment Config | `.kiro/docs/standards/environment-config.md` | ConfigModule, validation |
| Definition of Done | `.kiro/docs/standards/definition-of-done.md` | Mandatory checklist |
| Ticket Standards | `.kiro/docs/standards/ticket-standards.md` | GitHub issue format |
| Telegram Format | `.kiro/docs/protocols/telegram-message-format.md` | Message templates |
| 9Router Contract | `.kiro/docs/contracts/9router-api-contract.md` | Model gateway API |
| Contract Registry | `.kiro/docs/contracts/README.md` | All integration contracts |
| Task Packet | `.kiro/docs/templates/task-packet.md` | PM → Agent Lead handoff |

Non-compliance with these standards is a review blocker.
