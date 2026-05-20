import { Module } from '@nestjs/common';
import { TasksController } from '../presentation/controllers/tasks.controller';
import { CreateTaskUseCase, UpdateTaskStatusUseCase, GetTaskUseCase, ListTasksUseCase } from '../application/use-cases/task.use-cases';
import { TaskRepository } from '../infrastructure/repositories/task.repository';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { ITaskRepository } from '../application/ports/repositories.interface';

@Module({
  controllers: [TasksController],
  providers: [
    // Use Cases (Application Layer)
    CreateTaskUseCase,
    UpdateTaskStatusUseCase,
    GetTaskUseCase,
    ListTasksUseCase,
    
    // Repositories (Infrastructure Layer)
    {
      provide: 'ITaskRepository',
      useClass: TaskRepository,
    },
    
    // Infrastructure Services
    PrismaService,
  ],
  exports: [
    CreateTaskUseCase,
    UpdateTaskStatusUseCase,
    GetTaskUseCase,
    ListTasksUseCase,
  ],
})
export class TasksModule {}