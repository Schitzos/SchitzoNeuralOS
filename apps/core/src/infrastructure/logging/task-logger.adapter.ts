import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ITaskLoggerPort,
  TaskLogEntry,
  TaskLogRecord,
  LogLevel,
} from '../../application/ports/task-logger.port';

@Injectable()
export class TaskLoggerAdapter implements ITaskLoggerPort {
  private readonly logger = new Logger(TaskLoggerAdapter.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: TaskLogEntry): Promise<TaskLogRecord> {
    this.logger.debug(`[${entry.level}] Task ${entry.taskId}: ${entry.message}`);

    const record = await this.prisma.log.create({
      data: {
        taskId: entry.taskId,
        level: entry.level,
        message: entry.message,
        metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : undefined,
      },
    });

    return {
      id: record.id,
      taskId: record.taskId,
      level: record.level as LogLevel,
      message: record.message,
      metadata: record.metadata as Record<string, unknown> | undefined,
      createdAt: record.createdAt,
    };
  }

  async getLogsForTask(
    taskId: string,
    options?: { level?: LogLevel; limit?: number; offset?: number },
  ): Promise<TaskLogRecord[]> {
    const { level, limit = 50, offset = 0 } = options || {};

    const records = await this.prisma.log.findMany({
      where: {
        taskId,
        ...(level ? { level } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return records.map((record) => ({
      id: record.id,
      taskId: record.taskId,
      level: record.level as LogLevel,
      message: record.message,
      metadata: record.metadata as Record<string, unknown> | undefined,
      createdAt: record.createdAt,
    }));
  }

  async countLogsForTask(taskId: string, level?: LogLevel): Promise<number> {
    return this.prisma.log.count({
      where: {
        taskId,
        ...(level ? { level } : {}),
      },
    });
  }
}
