import { TaskId, UserPrompt } from '../value-objects';
import { TaskStatus, TaskType, ExecutionMode } from '../enums';

export class Task {
  constructor(
    public readonly id: TaskId,
    public readonly userPrompt: UserPrompt,
    public readonly projectId: string,
    public status: TaskStatus,
    public readonly taskType: TaskType,
    public readonly executionMode: ExecutionMode,
    public readonly createdAt: Date,
    public completedAt?: Date,
  ) {}

  // Business logic methods
  canTransitionTo(newStatus: TaskStatus): boolean {
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.PENDING]: [TaskStatus.QUEUED, TaskStatus.CANCELLED],
      [TaskStatus.QUEUED]: [TaskStatus.RUNNING, TaskStatus.CANCELLED],
      [TaskStatus.RUNNING]: [
        TaskStatus.SUCCESS,
        TaskStatus.FAILED,
        TaskStatus.BLOCKED,
        TaskStatus.WAITING_APPROVAL,
        TaskStatus.CANCELLED,
      ],
      [TaskStatus.WAITING_APPROVAL]: [TaskStatus.RUNNING, TaskStatus.CANCELLED],
      [TaskStatus.BLOCKED]: [TaskStatus.RUNNING, TaskStatus.CANCELLED],
      [TaskStatus.SUCCESS]: [], // Terminal state
      [TaskStatus.FAILED]: [TaskStatus.RUNNING], // Can retry
      [TaskStatus.CANCELLED]: [], // Terminal state
    };

    return validTransitions[this.status].includes(newStatus);
  }

  updateStatus(newStatus: TaskStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
    }

    this.status = newStatus;

    if (this.isCompleted()) {
      this.completedAt = new Date();
    }
  }

  isCompleted(): boolean {
    return [TaskStatus.SUCCESS, TaskStatus.FAILED, TaskStatus.CANCELLED].includes(this.status);
  }

  isRunning(): boolean {
    return this.status === TaskStatus.RUNNING;
  }

  requiresApproval(): boolean {
    return this.status === TaskStatus.WAITING_APPROVAL;
  }

  getDuration(): number | null {
    if (!this.completedAt) {
      return null;
    }
    return this.completedAt.getTime() - this.createdAt.getTime();
  }
}