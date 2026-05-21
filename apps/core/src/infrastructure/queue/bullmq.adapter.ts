import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, Job } from 'bullmq';
import { IJobQueuePort, JobData, JobResult } from '../../application/ports/job-queue.port';

const TASK_QUEUE_NAME = 'schitzo-tasks';

export interface TaskJobProcessor {
  process(data: JobData): Promise<void>;
}

@Injectable()
export class BullMQAdapter implements IJobQueuePort, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BullMQAdapter.name);
  private queue: Queue;
  private worker: Worker | null = null;
  private processor: TaskJobProcessor | null = null;
  private readonly redisConnection: { host: string; port: number };

  constructor(private readonly config: ConfigService) {
    const redisUrl = this.config.get<string>('REDIS_URL') || 'redis://localhost:6379';
    const url = new URL(redisUrl);
    this.redisConnection = {
      host: url.hostname,
      port: parseInt(url.port, 10) || 6379,
    };

    this.queue = new Queue(TASK_QUEUE_NAME, {
      connection: this.redisConnection,
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(`BullMQ queue "${TASK_QUEUE_NAME}" initialized (Redis: ${this.redisConnection.host}:${this.redisConnection.port})`);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('BullMQ worker closed');
    }
    await this.queue.close();
    this.logger.log('BullMQ queue closed');
  }

  setProcessor(processor: TaskJobProcessor): void {
    this.processor = processor;
    this.startWorker();
  }

  async addJob(data: JobData): Promise<JobResult> {
    const job = await this.queue.add('process-task', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    });

    this.logger.log(`Job added: ${job.id} for task ${data.taskId}`);

    return {
      jobId: job.id || '',
      status: 'queued',
    };
  }

  async getJobStatus(jobId: string): Promise<JobResult | null> {
    const job = await this.queue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const statusMap: Record<string, JobResult['status']> = {
      waiting: 'queued',
      delayed: 'queued',
      active: 'active',
      completed: 'completed',
      failed: 'failed',
    };

    return {
      jobId: job.id || '',
      status: statusMap[state] || 'queued',
    };
  }

  private startWorker(): void {
    if (this.worker) {
      return;
    }

    this.worker = new Worker(
      TASK_QUEUE_NAME,
      async (job: Job<JobData>) => {
        this.logger.log(`Processing job ${job.id} for task ${job.data.taskId}`);

        if (!this.processor) {
          throw new Error('No processor registered');
        }

        await this.processor.process(job.data);
      },
      {
        connection: this.redisConnection,
        concurrency: 1,
      },
    );

    this.worker.on('completed', (job: Job) => {
      this.logger.log(`Job ${job.id} completed for task ${job.data.taskId}`);
    });

    this.worker.on('failed', (job: Job | undefined, error: Error) => {
      this.logger.error(`Job ${job?.id} failed: ${error.message}`);
    });

    this.logger.log('BullMQ worker started');
  }
}
