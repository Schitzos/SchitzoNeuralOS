# Integration Contract Registry

## Rule

Every cross-module integration must have a contract document before implementation begins.

---

## Contracts

| Contract | Owner | Version | File | Consumers | Status |
|----------|-------|---------|------|-----------|--------|
| 9Router Chat API | NineRouterModule | 1.0 | [9router-api-contract.md](./9router-api-contract.md) | ModelCallService, HermesService | ✅ Defined |
| Telegram Webhook | TelegramModule | 1.0 | TBD | Schitzo Core | 🔲 Phase 1 |
| Task API | TasksModule | 1.0 | TBD | Console, CLI, Telegram | 🔲 Phase 1 |
| BullMQ Job Payload | QueueModule | 1.0 | TBD | WorkflowProcessor | 🔲 Phase 1 |
| Model Call Response | ModelCallService | 1.0 | TBD | AgentRun persistence | 🔲 Phase 1 |
| Hermes I/O | HermesModule | 1.0 | TBD | WorkflowNodes | 🔲 Phase 2 |
| WebSocket Events | EventsModule | 1.0 | TBD | Neural Console | 🔲 Phase 4 |
| Task Packet | PM → Agent Lead | 1.0 | [task-packet.md](../templates/task-packet.md) | LangGraph agent_lead_node | ✅ Defined |

---

## Status Legend

| Icon | Meaning |
|------|---------|
| ✅ | Contract defined and ready |
| 🔲 | Planned, not yet defined |
| 🔄 | In revision |

---

## Adding a New Contract

Create a file in `docs/contracts/` with:

```markdown
# <Contract Name>

## Overview
Brief description of what this contract covers.

## Connection
Base URL, auth, transport details.

## Request Schema
TypeScript interface for input.

## Response Schema
TypeScript interface for output.

## Error Schema
Error response format and codes.

## Retry Policy
Retry behavior and backoff.

## Consumers
Which modules depend on this contract.
```

Then add it to the table above.

---

## Governance Rules

1. No implementation starts without a defined contract.
2. Contract changes require @ARC approval.
3. Breaking changes require version bump and consumer notification.
4. All contracts include TypeScript interfaces.
5. Contracts are tested via integration tests.
