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
  USER_PROMPT = 'user_prompt',
  SYSTEM_TASK = 'system_task',
  AGENT_TASK = 'agent_task',
  SCHEDULED_TASK = 'scheduled_task',
}

export enum ExecutionMode {
  SYNC = 'sync',
  ASYNC = 'async',
  BATCH = 'batch',
  STREAMING = 'streaming',
}