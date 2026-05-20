// Port: Task Intake — defines the contract for receiving tasks from external sources

export const TASK_INTAKE_PORT = Symbol('TASK_INTAKE_PORT');

export interface TaskIntakeCommand {
  userPrompt: string;
  sourceType: TaskSource;
  sourceChatId?: number;
  sourceMessageId?: number;
  projectId?: string;
}

export type TaskSource = 'telegram' | 'cli' | 'api';

export interface TaskIntakeResult {
  taskId: string;
  status: string;
  message: string;
}

export interface ITaskIntakePort {
  submit(command: TaskIntakeCommand): Promise<TaskIntakeResult>;
}
