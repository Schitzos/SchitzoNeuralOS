import { Inject, Injectable, Logger } from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import { TaskId, UserPrompt } from '../../domain/value-objects';
import { TaskStatus, TaskType, ExecutionMode } from '../../domain/enums';
import { ITaskRepository } from '../ports/repositories.interface';
import {
  TaskIntakeCommand,
  TaskIntakeResult,
  ITaskIntakePort,
} from '../ports/task-intake.port';

const DEFAULT_PROJECT_ID = '550e8400-e29b-41d4-a716-446655440000';

@Injectable()
export class TaskIntakeUseCase implements ITaskIntakePort {
  private readonly logger = new Logger(TaskIntakeUseCase.name);
  private readonly taskRepository: ITaskRepository;

  constructor(
    @Inject('ITaskRepository') taskRepository: ITaskRepository,
  ) {
    this.taskRepository = taskRepository;
  }

  async submit(command: TaskIntakeCommand): Promise<TaskIntakeResult> {
    this.logger.log(
      `Receiving task from ${command.sourceType}: "${command.userPrompt.substring(0, 50)}..."`,
    );

    const taskType = this.classifyTaskType(command.userPrompt);
    const projectId = command.projectId || DEFAULT_PROJECT_ID;

    const taskId = new TaskId(`task-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`);
    const userPrompt = new UserPrompt(command.userPrompt);

    const task = new Task(
      taskId,
      userPrompt,
      projectId,
      TaskStatus.PENDING,
      taskType,
      ExecutionMode.SINGLE,
      new Date(),
    );

    const created = await this.taskRepository.create(task);

    this.logger.log(`Task created: ${created.id.toString()} [${taskType}] status=${created.status}`);

    return {
      taskId: created.id.toString(),
      status: created.status,
      message: `Task received and queued. ID: ${created.id.toString()}`,
    };
  }

  private classifyTaskType(prompt: string): TaskType {
    const lower = prompt.toLowerCase();

    if (lower.includes('fix') || lower.includes('bug') || lower.includes('error')) {
      return TaskType.BUG_FIX;
    }
    if (lower.includes('refactor') || lower.includes('clean up') || lower.includes('restructure')) {
      return TaskType.REFACTOR;
    }
    if (lower.includes('doc') || lower.includes('readme') || lower.includes('comment')) {
      return TaskType.DOCUMENTATION;
    }
    if (lower.includes('test') || lower.includes('spec') || lower.includes('coverage')) {
      return TaskType.TESTING;
    }

    return TaskType.FEATURE;
  }
}
