import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { envValidationSchema } from './config/env.validation';

// Presentation
import { AppController } from './presentation/controllers/app.controller';
import { TasksController } from './presentation/controllers/tasks.controller';
import { TelegramController } from './presentation/controllers/telegram.controller';
import { AuthGuard } from './presentation/guards/auth.guard';

// Application - Use Cases
import {
  CreateTaskUseCase,
  UpdateTaskStatusUseCase,
  GetTaskUseCase,
  ListTasksUseCase,
} from './application/use-cases/task.use-cases';
import { HandleWebhookUseCase } from './application/use-cases/handle-webhook.use-case';
import { TaskIntakeUseCase } from './application/use-cases/task-intake.use-case';
import { ProcessTaskUseCase } from './application/use-cases/process-task.use-case';
import { SendTelegramResponseUseCase } from './application/use-cases/send-telegram-response.use-case';
import { HandleStatusCommandUseCase } from './application/use-cases/handle-status-command.use-case';
import { TaskStatusTracker } from './domain/services/task-status-tracker.service';
import { TASK_LOGGER_PORT } from './application/ports/task-logger.port';
import { TaskLoggerAdapter } from './infrastructure/logging/task-logger.adapter';
import { TELEGRAM_PORT } from './application/ports/telegram.port';
import { TASK_INTAKE_PORT } from './application/ports/task-intake.port';
import { NINE_ROUTER_PORT } from './application/ports/nine-router.port';
import { JOB_QUEUE_PORT } from './application/ports/job-queue.port';

// Infrastructure
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { TaskRepository } from './infrastructure/repositories/task.repository';
import { TelegramApiAdapter } from './infrastructure/adapters/telegram-api.adapter';
import { NineRouterAdapter } from './infrastructure/adapters/nine-router.adapter';
import { BullMQAdapter } from './infrastructure/queue/bullmq.adapter';
import { AgentRegistryService } from './infrastructure/services/agent-registry.service';
import { ModelPricingService } from './infrastructure/services/model-pricing.service';
import { TelegramPollingService } from './infrastructure/adapters/telegram-polling.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true, allowUnknown: true },
    }),
  ],
  controllers: [AppController, TasksController, TelegramController],
  providers: [
    // Global Guards
    { provide: APP_GUARD, useClass: AuthGuard },

    // Infrastructure
    PrismaService,
    TaskRepository,
    { provide: 'ITaskRepository', useClass: TaskRepository },
    { provide: TELEGRAM_PORT, useClass: TelegramApiAdapter },
    TelegramApiAdapter,
    { provide: NINE_ROUTER_PORT, useClass: NineRouterAdapter },
    NineRouterAdapter,
    { provide: JOB_QUEUE_PORT, useClass: BullMQAdapter },
    BullMQAdapter,
    AgentRegistryService,
    ModelPricingService,

    // Application - Use Cases
    CreateTaskUseCase,
    UpdateTaskStatusUseCase,
    GetTaskUseCase,
    ListTasksUseCase,
    HandleWebhookUseCase,
    TaskIntakeUseCase,
    { provide: TASK_INTAKE_PORT, useClass: TaskIntakeUseCase },
    ProcessTaskUseCase,
    SendTelegramResponseUseCase,
    HandleStatusCommandUseCase,
    TaskStatusTracker,
    { provide: TASK_LOGGER_PORT, useClass: TaskLoggerAdapter },
    TaskLoggerAdapter,
    TelegramPollingService,
  ],
  exports: [
    PrismaService,
    AgentRegistryService,
    ModelPricingService,
  ],
})
export class AppModule {}
