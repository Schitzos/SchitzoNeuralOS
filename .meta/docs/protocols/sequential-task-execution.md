# Sequential Task Execution Protocol

## Overview

When executing any phase, tasks must be completed **one at a time in sequential order**, not all tasks together. This ensures proper dependency management, quality control, and clear progress tracking.

## Protocol Rules

### 🔄 **Sequential Execution**
- **ONE TASK AT A TIME**: Only one task can be in progress at any given moment
- **COMPLETION REQUIRED**: Current task must be 100% complete before starting the next
- **NO PARALLEL EXECUTION**: Multiple tasks within a phase cannot run simultaneously
- **DEPENDENCY RESPECT**: Tasks must complete in the specified order (PHASE-X.1 → PHASE-X.2 → PHASE-X.3, etc.)

### ✅ **Task Completion Criteria**
Each task is considered complete only when ALL of the following are satisfied:

1. **Implementation Complete**: All code written and functional
2. **Zero-Error Protocol Passed**: 
   - ✅ TypeScript compilation (0 errors)
   - ✅ Unit tests (100% pass rate)
   - ✅ Code linting (0 errors, warnings acceptable)
   - ✅ Build verification (successful)
3. **GitHub Issue Closed**: Corresponding issue marked as completed
4. **Documentation Updated**: Any necessary docs updated
5. **Integration Verified**: Component integrates properly with existing system

### 📋 **Execution Workflow**

#### **Before Starting Any Task:**
1. Verify previous task is 100% complete
2. Read task requirements from GitHub issue
3. Understand dependencies and acceptance criteria
4. Confirm system is in clean state

#### **During Task Execution:**
1. Focus only on current task
2. Do not start work on future tasks
3. Follow zero-error protocol continuously
4. Update progress in GitHub issue comments

#### **After Task Completion:**
1. Run full zero-error protocol validation
2. Verify all acceptance criteria met
3. Close GitHub issue with completion summary
4. Commit changes with conventional commit message
5. Confirm system ready for next task

### 🚫 **Prohibited Actions**
- **NO BATCH PROCESSING**: Cannot work on multiple tasks simultaneously
- **NO SKIPPING**: Cannot skip tasks or change execution order
- **NO PARTIAL COMPLETION**: Cannot leave tasks in incomplete state
- **NO ASSUMPTION**: Cannot assume previous tasks are complete without verification

### 📊 **Progress Tracking**

#### **Task States:**
- **PENDING**: Not started, waiting for previous task completion
- **IN_PROGRESS**: Currently being worked on (only one task can have this state)
- **COMPLETED**: All completion criteria satisfied, GitHub issue closed
- **BLOCKED**: Cannot proceed due to external dependency

#### **Phase States:**
- **NOT_STARTED**: No tasks begun
- **IN_PROGRESS**: At least one task completed, others pending
- **COMPLETED**: All tasks in phase completed successfully
- **FAILED**: One or more tasks failed and cannot be resolved

### 🔧 **Implementation Guidelines**

#### **For Agents:**
- Read this protocol before starting any phase
- Confirm understanding of sequential execution requirement
- Focus on one task at a time
- Do not attempt to optimize by working on multiple tasks
- Report progress after each task completion

#### **For Orchestrators:**
- Verify only one task is in progress at any time
- Do not spawn multiple agents for same phase
- Ensure proper handoff between tasks
- Monitor completion criteria for each task

### 📝 **Reporting Format**

#### **Task Start Report:**
```text
🚀 STARTING TASK: PHASE-X.Y
- GitHub Issue: #N
- Previous Task: COMPLETED ✅
- Dependencies: [list any]
- Estimated Duration: [time]
- Agent: @AGENT_NAME
```

#### **Task Completion Report:**
```text
✅ TASK COMPLETED: PHASE-X.Y
- GitHub Issue: #N CLOSED
- Zero-Error Protocol: ✅ PASSED
- Integration: ✅ VERIFIED
- Next Task: PHASE-X.Z (ready to start)
- Duration: [actual time]
```

#### **Phase Completion Report:**
```text
🎉 PHASE X COMPLETED
- Total Tasks: X/X completed
- Success Rate: 100%
- Total Duration: [time]
- All GitHub Issues: CLOSED
- System Status: READY for Phase X+1
```

### ⚠️ **Exception Handling**

#### **If Task Fails:**
1. Stop all work immediately
2. Document failure reason and blockers
3. Do not proceed to next task
4. Report failure with resolution plan
5. Wait for explicit instruction to retry or skip

#### **If Dependencies Missing:**
1. Mark task as BLOCKED
2. Identify missing dependencies
3. Request dependency resolution
4. Do not attempt workarounds
5. Wait for proper dependency satisfaction

### 🎯 **Success Metrics**

- **Task Completion Rate**: 100% of tasks completed in order
- **Quality Gate Pass Rate**: 100% zero-error protocol compliance
- **Issue Tracking Accuracy**: All GitHub issues properly managed
- **Sequential Compliance**: No parallel task execution violations
- **Integration Success**: All components work together properly

---

## 🔒 **ENFORCEMENT**

This protocol is **MANDATORY** for all phase execution. Any violation of sequential execution will result in:

1. **Immediate Stop**: All work halted
2. **State Reset**: Return to last known good state
3. **Protocol Review**: Re-read and confirm understanding
4. **Restart**: Begin again with proper sequential execution

**"One task, one focus, one completion at a time."**