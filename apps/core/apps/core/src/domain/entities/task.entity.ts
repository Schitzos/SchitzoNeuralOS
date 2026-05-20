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
    public readonly metadata?: Record<string, any>
  ) {}

  // Business logic methods
  canTransitionTo(newStatus: TaskStatus): boolean {
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.PENDING]: [TaskStatus.QUEUED, TaskStatus.CANCELLED],
      [TaskStatus.QUEUED]: [TaskStatus.RUNNING, TaskStatus.CANCELLED],
      [TaskStatus.RUNNING]: [TaskStatus.SUCCESS, TaskStatus.FAILED, TaskStatus.BLOCKED],
      [TaskStatus.BLOCKED]: [TaskStatus.QUEUED, TaskStatus.CANCELLED],
      [TaskStatus.WAITING_APPROVAL]: [TaskStatus.QUEUED, TaskStatus.CANCELLED],
      [TaskStatus.SUCCESS]: [], // Terminal state
      [TaskStatus.FAILED]: [TaskStatus.QUEUED], // Can retry
      [TaskStatus.CANCELLED]: [], // Terminal state
    };

    return validTransitions[this.status]?.includes(newStatus) ?? false;
  }

  updateStatus(newStatus: TaskStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
    }
    
    this.status = newStatus;
    
    if (newStatus === TaskStatus.SUCCESS || newStatus === TaskStatus.FAILED || newStatus === TaskStatus.CANCELLED) {
      this.completedAt = new Date();
    }
  }

  isCompleted(): boolean {
    return [TaskStatus.SUCCESS, TaskStatus.FAILED, TaskStatus.CANCELLED].includes(this.status);
  }

  getDuration(): number | null {
    if (!this.completedAt) {
      return null;
    }
    return this.completedAt.getTime() - this.createdAt.getTime();
  }

  static create(params: {
    userPrompt: string;
    projectId: string;
    taskType?: TaskType;
    executionMode?: ExecutionMode;
    metadata?: Record<string, any>;
  }): Task {
    return new Task(
      new TaskId(crypto.randomUUID()),
      new UserPrompt(params.userPrompt),
      params.projectId,
      TaskStatus.PENDING,
      params.taskType ?? TaskType.USER_PROMPT,
      params.executionMode ?? ExecutionMode.ASYNC,
      new Date(),
      undefined,
      params.metadata
    );
  }
}