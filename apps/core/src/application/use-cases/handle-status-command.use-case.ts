// Use case: Handle /status command from Telegram
// Returns system health, queue status, and recent task summary

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITelegramPort, TELEGRAM_PORT } from '../ports/telegram.port';
import { ITaskRepository } from '../ports/repositories.interface';
import { IJobQueuePort, JOB_QUEUE_PORT } from '../ports/job-queue.port';
import { TaskStatus } from '../../domain/enums';

export interface StatusCommandResult {
  systemHealth: 'healthy' | 'degraded' | 'down';
  queueStatus: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  recentTasks: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
  };
}

@Injectable()
export class HandleStatusCommandUseCase {
  private readonly logger = new Logger(HandleStatusCommandUseCase.name);
  private readonly telegramPort: ITelegramPort;
  private readonly taskRepository: ITaskRepository;
  private readonly jobQueue: IJobQueuePort;

  constructor(
    @Inject(TELEGRAM_PORT) telegramPort: ITelegramPort,
    @Inject('ITaskRepository') taskRepository: ITaskRepository,
    @Inject(JOB_QUEUE_PORT) jobQueue: IJobQueuePort,
  ) {
    this.telegramPort = telegramPort;
    this.taskRepository = taskRepository;
    this.jobQueue = jobQueue;
  }

  async execute(chatId: number): Promise<StatusCommandResult> {
    this.logger.log(`Processing /status command for chat ${chatId}`);

    // Gather status info
    const [queueStatus, recentTasks] = await Promise.all([
      this.getQueueStatus(),
      this.getRecentTaskStats(),
    ]);

    // Determine system health
    const systemHealth = this.determineHealth(queueStatus, recentTasks);

    const result: StatusCommandResult = {
      systemHealth,
      queueStatus,
      recentTasks,
    };

    // Format and send response
    const message = this.formatStatusMessage(result);
    await this.telegramPort.sendMessage(chatId, message);

    return result;
  }

  private async getQueueStatus(): Promise<StatusCommandResult['queueStatus']> {
    try {
      const status = await this.jobQueue.getJobStatus('__queue_health_check__');
      // If we can query the queue, it's working
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        ...status,
      };
    } catch {
      // Queue might not have this job, return defaults
      return { waiting: 0, active: 0, completed: 0, failed: 0 };
    }
  }

  private async getRecentTaskStats(): Promise<StatusCommandResult['recentTasks']> {
    const result = await this.taskRepository.findMany({});

    const stats = {
      total: result.total,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };

    for (const task of result.data) {
      switch (task.status) {
        case TaskStatus.PENDING:
        case TaskStatus.QUEUED:
          stats.pending++;
          break;
        case TaskStatus.RUNNING:
          stats.running++;
          break;
        case TaskStatus.SUCCESS:
          stats.completed++;
          break;
        case TaskStatus.FAILED:
          stats.failed++;
          break;
      }
    }

    return stats;
  }

  private determineHealth(
    queueStatus: StatusCommandResult['queueStatus'],
    recentTasks: StatusCommandResult['recentTasks'],
  ): 'healthy' | 'degraded' | 'down' {
    // If many tasks are failing, system is degraded
    if (recentTasks.total > 0) {
      const failRate = recentTasks.failed / recentTasks.total;
      if (failRate > 0.5) return 'degraded';
    }

    // If queue has many failed jobs, degraded
    if (queueStatus.failed > 10) return 'degraded';

    return 'healthy';
  }

  private formatStatusMessage(result: StatusCommandResult): string {
    const healthEmoji = {
      healthy: '🟢',
      degraded: '🟡',
      down: '🔴',
    };

    return [
      `${healthEmoji[result.systemHealth]} *SchitzoNeuralOS Status*`,
      ``,
      `*System:* ${result.systemHealth.toUpperCase()}`,
      ``,
      `📋 *Tasks*`,
      `  Total: ${result.recentTasks.total}`,
      `  Pending: ${result.recentTasks.pending}`,
      `  Running: ${result.recentTasks.running}`,
      `  Completed: ${result.recentTasks.completed}`,
      `  Failed: ${result.recentTasks.failed}`,
      ``,
      `⚡ *Queue*`,
      `  Waiting: ${result.queueStatus.waiting}`,
      `  Active: ${result.queueStatus.active}`,
      `  Completed: ${result.queueStatus.completed}`,
      `  Failed: ${result.queueStatus.failed}`,
    ].join('\n');
  }
}
