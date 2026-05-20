export enum TaskStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled',
  WAITING_APPROVAL = 'waiting_approval',
}

export enum TaskType {
  FEATURE = 'feature',
  BUG_FIX = 'bug_fix',
  REFACTOR = 'refactor',
  DOCUMENTATION = 'documentation',
  TESTING = 'testing',
}

export enum ExecutionMode {
  SINGLE = 'single',
  COMPARE = 'compare',
  BATCH = 'batch',
}

export enum AgentType {
  FOUNDING = 'founding',
  SPECIALIST = 'specialist',
  TEMPORARY = 'temporary',
}

export enum AgentStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  BUSY = 'busy',
  DISABLED = 'disabled',
}