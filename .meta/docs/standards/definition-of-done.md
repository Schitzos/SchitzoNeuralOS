# Definition of Done

Every task must pass ALL items before status can move to Done.

---

## Checklist

### Git & Branch

- [ ] Feature branch created from `develop` (`feature/PHASE-X.Y-slug`)
- [ ] Only task-related files committed
- [ ] Conventional commit messages used

### Implementation

- [ ] Implementation matches all acceptance criteria
- [ ] Follows coding standards (Clean Architecture, naming, patterns)
- [ ] No `any` types introduced
- [ ] No hardcoded secrets or credentials

### Testing

- [ ] Unit tests written and passing (100% pass rate)
- [ ] Coverage meets targets:
  - Services: 90%+
  - Controllers: 80%+
  - Utilities: 95%+
- [ ] Integration test written (if task involves cross-module interaction)

### Build & Lint

- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] No new vulnerabilities (`npm audit`)

### Integration Sync

- [ ] GitHub issue updated with implementation notes
- [ ] Kanban card moved to QA Review

### Review Gates

- [ ] @QA validation passed (runtime + test checks)
- [ ] @REV code review approved
- [ ] PR created with linked issue

---

## Failure Handling

If any item fails:

1. Task returns to implementing agent with specific failure reason.
2. Max 2 repair cycles allowed.
3. After 2 failures, task is marked `blocked` and escalated to human.

---

## Exceptions

- Documentation-only tasks skip testing requirements.
- Config/env tasks skip coverage targets.
- All exceptions must be documented in the PR description.
