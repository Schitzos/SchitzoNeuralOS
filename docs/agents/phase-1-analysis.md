# Phase 1 Agent Requirements Analysis

**Date:** 2026-05-20  
**Analyst:** @ARC  
**Phase:** Phase 1 — Basic Control Loop  

---

## Phase 1 Deliverables Analysis

Phase 1 implements the basic control loop: `Telegram → Schitzo Core → 9Router → Model → Telegram`

### Required Deliverables:
1. Telegram bot webhook integration
2. Task intake service  
3. 9Router integration
4. BullMQ job queue
5. Basic model call via 9Router
6. Telegram response service
7. Task status tracking
8. Basic task logs
9. /status command
10. End-to-end control loop test
11. Schitzo CLI interactive terminal client
12. CLI → Schitzo Core integration

---

## Recommended Agent Team for Phase 1

### Primary Implementation Agents

#### 1. Backend Agent (@BE) — **REQUIRED**
- **Role:** Core NestJS implementation
- **Responsibilities:**
  - Implement all NestJS modules, services, controllers
  - Build Telegram webhook integration
  - Implement task intake and status tracking services
  - Build 9Router adapter and model call service
  - Implement BullMQ queue integration
  - Create CLI client application
- **Required Tools:** `fs_read`, `fs_write`, `grep`, `glob`, `code`, `shell`
- **Model Tier:** Strong coding model (complex TypeScript/NestJS work)
- **Justification:** Phase 1 is 90% backend implementation. @BE is essential.

#### 2. QA Agent (@QA) — **REQUIRED**
- **Role:** Validation and testing
- **Responsibilities:**
  - Write unit tests for all services
  - Create end-to-end control loop test
  - Validate API contracts and error handling
  - Ensure 100% test pass rate before Done
- **Required Tools:** `fs_read`, `grep`, `glob`, `code`, `shell`
- **Model Tier:** Standard model (testing patterns)
- **Justification:** Phase 1 establishes core quality gates. Testing is mandatory.

### Supporting Agents

#### 3. DevOps Agent (@OPS) — **RECOMMENDED**
- **Role:** Infrastructure and tooling
- **Responsibilities:**
  - Configure PM2 ecosystem for new services
  - Update CI/CD pipeline for new modules
  - Handle environment configuration
  - Setup Redis/PostgreSQL connections
- **Required Tools:** `fs_read`, `fs_write`, `grep`, `glob`, `code`, `shell`
- **Model Tier:** Standard model (configuration work)
- **Justification:** Phase 1 introduces new infrastructure components (Redis, BullMQ)

#### 4. Security Agent (@SEC) — **RECOMMENDED**
- **Role:** Security validation
- **Responsibilities:**
  - Review Telegram webhook security
  - Validate auth token implementation
  - Ensure proper input validation
  - Review 9Router integration security
- **Required Tools:** `fs_read`, `grep`, `glob`, `code`
- **Model Tier:** Standard model (security review)
- **Justification:** Phase 1 introduces external integrations requiring security review

### Agents NOT Required for Phase 1

#### Frontend Agent (@FE) — **NOT NEEDED**
- **Reason:** Phase 1 has no dashboard/UI work
- **Defer to:** Phase 4 (Neural Pipeline Dashboard)

#### Architect Agent (@ARC) — **MINIMAL NEED**
- **Reason:** Architecture is already defined in specs
- **Usage:** Consultation only for integration contracts

#### Agent Lead (@AL) — **NOT NEEDED**
- **Reason:** Phase 1 predates LangGraph workflow implementation
- **Defer to:** Phase 2 (LangGraph Pipeline Foundation)

---

## Integration Requirements

### External Dependencies
1. **9Router** — Must be running and accessible
2. **PostgreSQL** — Database must be initialized with Prisma migrations
3. **Redis** — Required for BullMQ job queue
4. **Telegram Bot Token** — Must be configured in environment

### Environment Variables Required
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ALLOWED_USER_IDS=...
NINE_ROUTER_URL=http://localhost:20128
NINE_ROUTER_API_KEY=...
AUTH_TOKEN=...
```

---

## Risk Assessment

### High Risk
- **9Router Integration:** External dependency, potential API changes
- **Telegram Webhook:** Network reliability, webhook validation

### Medium Risk  
- **BullMQ Queue:** New technology introduction, Redis dependency
- **CLI Client:** Cross-platform compatibility (Windows focus)

### Low Risk
- **Task Services:** Standard CRUD operations
- **Status Tracking:** Simple state management

---

## Success Criteria

Phase 1 is complete when:
1. User can send message to Telegram bot
2. Task is created and stored in database
3. Model call is made via 9Router
4. Response is returned to Telegram
5. CLI client can submit tasks and check status
6. All tests pass (100% pass rate)
7. End-to-end integration test validates full flow

---

## Recommended Implementation Order

1. **@BE**: Implement core services (task intake, status tracking)
2. **@BE**: Implement 9Router integration and model calls
3. **@BE**: Implement Telegram webhook and response services
4. **@BE**: Implement BullMQ job queue
5. **@QA**: Write unit tests for all services
6. **@BE**: Implement CLI client
7. **@QA**: Create end-to-end integration test
8. **@OPS**: Configure PM2 and deployment
9. **@SEC**: Security review of integrations
10. **@QA**: Final validation and sign-off

**Estimated Duration:** 2-3 weeks with dedicated @BE and @QA agents