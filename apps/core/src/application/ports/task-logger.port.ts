// Port: Task Logger — defines the contract for persisting task execution logs

export const TASK_LOGGER_PORT = Symbol('TASK_LOGGER_PORT');

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface TaskLogEntry {
  taskId: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface TaskLogRecord extends TaskLogEntry {
  id: string;
  createdAt: Date;
}

export interface ITaskLoggerPort {
  log(entry: TaskLogEntry): Promise<TaskLogRecord>;
  getLogsForTask(taskId: string, options?: { level?: LogLevel; limit?: number; offset?: number }): Promise<TaskLogRecord[]>;
  countLogsForTask(taskId: string, level?: LogLevel): Promise<number>;
}
