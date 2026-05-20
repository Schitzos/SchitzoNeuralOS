// Domain service: Task Status Tracker
// Manages valid status transitions and records status change history

import { Injectable, Logger } from '@nestjs/common';
import { TaskStatus } from '../enums';

export interface StatusTransition {
  from: TaskStatus;
  to: TaskStatus;
  timestamp: Date;
  reason?: string;
}

// Valid state machine transitions
const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.PENDING]: [TaskStatus.QUEUED, TaskStatus.CANCELLED],
  [TaskStatus.QUEUED]: [TaskStatus.RUNNING, TaskStatus.CANCELLED],
  [TaskStatus.RUNNING]: [TaskStatus.SUCCESS, TaskStatus.FAILED, TaskStatus.BLOCKED, TaskStatus.CANCELLED],
  [TaskStatus.SUCCESS]: [], // terminal state
  [TaskStatus.FAILED]: [TaskStatus.PENDING, TaskStatus.CANCELLED], // can retry
  [TaskStatus.BLOCKED]: [TaskStatus.PENDING, TaskStatus.CANCELLED],
  [TaskStatus.CANCELLED]: [], // terminal state
  [TaskStatus.WAITING_APPROVAL]: [TaskStatus.RUNNING, TaskStatus.CANCELLED],
};

export class InvalidTransitionError extends Error {
  constructor(from: TaskStatus, to: TaskStatus) {
    super(`Invalid status transition: ${from} → ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

@Injectable()
export class TaskStatusTracker {
  private readonly logger = new Logger(TaskStatusTracker.name);
  private readonly history: Map<string, StatusTransition[]> = new Map();

  /**
   * Validate and record a status transition
   */
  transition(taskId: string, from: TaskStatus, to: TaskStatus, reason?: string): StatusTransition {
    if (!this.isValidTransition(from, to)) {
      throw new InvalidTransitionError(from, to);
    }

    const transition: StatusTransition = {
      from,
      to,
      timestamp: new Date(),
      reason,
    };

    // Record in history
    const taskHistory = this.history.get(taskId) || [];
    taskHistory.push(transition);
    this.history.set(taskId, taskHistory);

    this.logger.log(`Task ${taskId}: ${from} → ${to}${reason ? ` (${reason})` : ''}`);

    return transition;
  }

  /**
   * Check if a transition is valid
   */
  isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
    const allowed = VALID_TRANSITIONS[from];
    return allowed?.includes(to) ?? false;
  }

  /**
   * Get all valid next states for a given status
   */
  getValidNextStates(status: TaskStatus): TaskStatus[] {
    return VALID_TRANSITIONS[status] || [];
  }

  /**
   * Get transition history for a task
   */
  getHistory(taskId: string): StatusTransition[] {
    return this.history.get(taskId) || [];
  }

  /**
   * Get the duration a task spent in a given status
   */
  getDurationInStatus(taskId: string, status: TaskStatus): number | null {
    const taskHistory = this.history.get(taskId);
    if (!taskHistory) return null;

    const enterTransition = taskHistory.find((t) => t.to === status);
    const exitTransition = taskHistory.find((t) => t.from === status);

    if (!enterTransition) return null;
    if (!exitTransition) {
      // Still in this status
      return Date.now() - enterTransition.timestamp.getTime();
    }

    return exitTransition.timestamp.getTime() - enterTransition.timestamp.getTime();
  }

  /**
   * Check if a task is in a terminal state
   */
  isTerminal(status: TaskStatus): boolean {
    return VALID_TRANSITIONS[status]?.length === 0;
  }

  /**
   * Clear history for a task (e.g., after archiving)
   */
  clearHistory(taskId: string): void {
    this.history.delete(taskId);
  }
}
