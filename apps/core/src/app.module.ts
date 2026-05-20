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
import { TELEGRAM_PORT } from './application/ports/telegram.port';

// Infrastructure
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { TaskRepository } from './infrastructure/repositories/task.repository';
import { TelegramApiAdapter } from './infrastructure/adapters/telegram-api.adapter';
import { AgentRegistryService } from './infrastructure/services/agent-registry.service';
import { ModelPricingService } from './infrastructure/services/model-pricing.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
    AgentRegistryService,
    ModelPricingService,

    // Application - Use Cases
    CreateTaskUseCase,
    UpdateTaskStatusUseCase,
    GetTaskUseCase,
    ListTasksUseCase,
    HandleWebhookUseCase,
  ],
  exports: [
    PrismaService,
    AgentRegistryService,
    ModelPricingService,
  ],
})
export class AppModule {}
