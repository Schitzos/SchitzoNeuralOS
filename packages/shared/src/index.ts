import { TaskStatus } from '@schitzo/types';

/** Valid state transitions per the workflow state machine */
export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  pending: ['queued', 'cancelled'],
  queued: ['running', 'cancelled'],
  running: ['waiting_approval', 'retrying', 'success', 'failed', 'blocked', 'cancelled'],
  waiting_approval: ['running', 'blocked', 'cancelled'],
  retrying: ['running', 'failed', 'blocked'],
  success: ['done'],
  failed: ['retrying', 'blocked'],
  blocked: ['running', 'cancelled'],
  done: ['archived'],
  cancelled: ['archived'],
  archived: [],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminalState(status: TaskStatus): boolean {
  return ['done', 'cancelled', 'archived'].includes(status);
}
