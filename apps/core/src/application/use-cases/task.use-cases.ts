import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import { TaskId, UserPrompt } from '../../domain/value-objects';
import { TaskStatus, TaskType, ExecutionMode } from '../../domain/enums';
import { ITaskRepository } from '../ports/repositories.interface';

export interface CreateTaskCommand {
  userPrompt: string;
  projectId: string;
  taskType?: TaskType;
  executionMode?: ExecutionMode;
}

@Injectable()
export class CreateTaskUseCase {
  constructor(@Inject('ITaskRepository') private readonly taskRepository: ITaskRepository) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    const taskId = new TaskId(`task-${Date.now()}`);
    const userPrompt = new UserPrompt(command.userPrompt);

    const task = new Task(
      taskId,
      userPrompt,
      command.projectId,
      TaskStatus.PENDING,
      command.taskType || TaskType.FEATURE,
      command.executionMode || ExecutionMode.SINGLE,
      new Date(),
    );

    return await this.taskRepository.create(task);
  }
}

@Injectable()
export class UpdateTaskStatusUseCase {
  constructor(@Inject('ITaskRepository') private readonly taskRepository: ITaskRepository) {}

  async execute(taskId: string, newStatus: TaskStatus): Promise<Task> {
    const id = new TaskId(taskId);
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    task.updateStatus(newStatus);

    return await this.taskRepository.update(id, {
      status: task.status,
      completedAt: task.completedAt,
    });
  }
}

@Injectable()
export class GetTaskUseCase {
  constructor(@Inject('ITaskRepository') private readonly taskRepository: ITaskRepository) {}

  async execute(taskId: string): Promise<Task | null> {
    const id = new TaskId(taskId);
    return await this.taskRepository.findById(id);
  }
}

@Injectable()
export class ListTasksUseCase {
  constructor(@Inject('ITaskRepository') private readonly taskRepository: ITaskRepository) {}

  async execute(params: {
    projectId?: string;
    status?: TaskStatus;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: Task[]; total: number; page: number; pageSize: number }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const result = await this.taskRepository.findMany({
      projectId: params.projectId,
      status: params.status,
      offset,
      limit: pageSize,
    });

    return {
      ...result,
      page,
      pageSize,
    };
  }
}
