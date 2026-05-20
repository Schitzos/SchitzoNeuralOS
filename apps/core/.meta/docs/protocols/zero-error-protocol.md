# Zero-Error Development Protocol

## Overview

Every piece of code written in Schitzo NeuralOS MUST pass all checks before being considered complete. No exceptions.

## Mandatory Checks (The Four Gates)

### 🔍 Gate 1: TypeScript Compilation
```bash
# Must pass with zero errors
npm run build
npx tsc --noEmit
```

**Requirements:**
- Zero TypeScript errors
- Zero TypeScript warnings
- All imports resolve correctly
- All types are properly defined

### 🧪 Gate 2: Unit Tests
```bash
# Must pass with 100% success rate
npm test
```

**Requirements:**
- All existing tests continue to pass
- New code has corresponding unit tests
- Test coverage for all public methods
- Edge cases and error conditions tested

### 🎯 Gate 3: Linting
```bash
# Must pass with zero violations
npm run lint
```

**Requirements:**
- Zero ESLint errors
- Zero ESLint warnings
- Code follows established style guide
- No unused imports or variables

### ✅ Gate 4: Runtime Validation
```bash
# Must start without errors
npm run dev:core
```

**Requirements:**
- Application starts successfully
- No runtime errors in console
- All modules load correctly
- Database connections work

## Implementation Protocol

### For Every New File:

1. **Write the code**
2. **Run TypeScript check:** `npx tsc --noEmit`
3. **Fix all TypeScript errors**
4. **Write unit tests**
5. **Run tests:** `npm test <file-pattern>`
6. **Ensure 100% test pass rate**
7. **Run linter:** `npm run lint`
8. **Fix all lint violations**
9. **Test runtime:** Start application and verify no errors

### For Every Code Change:

1. **Make the change**
2. **Run full build:** `npm run build`
3. **Run all tests:** `npm test`
4. **Run linter:** `npm run lint`
5. **Verify runtime:** `npm run dev:core`
6. **Only proceed if ALL checks pass**

## Error Resolution Strategy

### TypeScript Errors:
- **Import Issues:** Fix import paths immediately
- **Type Issues:** Add proper type annotations
- **Missing Dependencies:** Install required packages
- **Configuration Issues:** Update tsconfig.json if needed

### Test Failures:
- **Fix broken tests immediately**
- **Add missing test coverage**
- **Update tests when behavior changes**
- **Never skip or ignore failing tests**

### Lint Violations:
- **Fix style issues immediately**
- **Remove unused code**
- **Follow naming conventions**
- **Add missing documentation**

### Runtime Errors:
- **Fix dependency injection issues**
- **Resolve module loading problems**
- **Fix database connection issues**
- **Ensure environment variables are set**

## Automation Commands

### Quick Check (for development)
```bash
npm run check
```

### Full Validation (before commit)
```bash
npm run validate
```

### Pre-commit Hook
```bash
# Automatically runs on git commit
npm run pre-commit
```

## Enforcement Rules

### 🚫 **NEVER ALLOWED:**
- Committing code with TypeScript errors
- Skipping unit tests for new code
- Ignoring lint violations
- Pushing code that breaks the build
- Using `@ts-ignore` without justification
- Using `any` type without explicit reason

### ✅ **ALWAYS REQUIRED:**
- TypeScript compilation success
- 100% unit test pass rate
- Zero lint violations
- Successful application startup
- Proper error handling
- Type safety throughout

## Quality Gates by Layer

### Domain Layer:
- **Pure TypeScript:** No framework dependencies
- **100% Test Coverage:** All business logic tested
- **Immutable Objects:** Value objects and entities
- **Type Safety:** Strong typing for all properties

### Application Layer:
- **Interface Contracts:** All ports properly typed
- **Use Case Tests:** Each use case has unit tests
- **Error Handling:** Proper exception handling
- **Dependency Injection:** Constructor injection only

### Infrastructure Layer:
- **Adapter Tests:** Repository implementations tested
- **Integration Tests:** Database operations tested
- **Configuration:** Environment validation
- **Error Recovery:** Graceful failure handling

### Presentation Layer:
- **DTO Validation:** All inputs validated
- **Controller Tests:** HTTP endpoints tested
- **Error Responses:** Proper HTTP error codes
- **Documentation:** API documentation complete

## Continuous Monitoring

### Development Workflow:
1. **Write code**
2. **Run checks continuously**
3. **Fix issues immediately**
4. **Never accumulate technical debt**

### CI/CD Pipeline:
- **Build Gate:** Must compile successfully
- **Test Gate:** All tests must pass
- **Lint Gate:** No violations allowed
- **Security Gate:** No vulnerabilities
- **Performance Gate:** No regressions

## Exception Handling

### Temporary Exceptions (Max 24 hours):
- **Document the exception reason**
- **Create tracking issue**
- **Set resolution deadline**
- **Add TODO comments in code**

### No Exceptions For:
- **Production deployments**
- **Main branch merges**
- **Release candidates**
- **Security-related code**

## Tools and Scripts

### Package.json Scripts:
```json
{
  "scripts": {
    "check": "tsc --noEmit && npm test && npm run lint",
    "validate": "npm run build && npm test && npm run lint && npm run start:check",
    "pre-commit": "lint-staged && npm run check",
    "start:check": "timeout 10s npm run dev:core || true"
  }
}
```

### Lint-staged Configuration:
```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.spec.ts": ["npm test -- --run"]
  }
}
```

## Success Metrics

### Daily Targets:
- **Zero build failures**
- **Zero test failures**
- **Zero lint violations**
- **Zero runtime errors**

### Weekly Targets:
- **100% test coverage maintained**
- **Zero technical debt accumulation**
- **All documentation up to date**
- **Performance benchmarks met**

---

## 🎯 **COMMITMENT**

Every developer and AI agent working on Schitzo NeuralOS commits to:

1. **Never compromise on code quality**
2. **Fix issues immediately when found**
3. **Write tests for all new code**
4. **Maintain zero-error standards**
5. **Follow this protocol religiously**

**"If it doesn't compile, test, lint, and run cleanly, it's not done."**