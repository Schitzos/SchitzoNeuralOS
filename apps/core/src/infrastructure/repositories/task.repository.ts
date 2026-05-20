import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task } from '../../domain/entities/task.entity';
import { TaskId, UserPrompt } from '../../domain/value-objects';
import { TaskStatus, TaskType, ExecutionMode } from '../../domain/enums';
import { ITaskRepository, FindTasksParams, TaskUpdateData } from '../../application/ports/repositories.interface';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(task: Task): Promise<Task> {
    const created = await this.prisma.task.create({
      data: {
        id: task.id.toString(),
        userPrompt: task.userPrompt.toString(),
        projectId: task.projectId,
        status: task.status,
        taskType: task.taskType,
        executionMode: task.executionMode,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
      },
    });

    return this.toDomain(created);
  }

  async findById(id: TaskId): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id: id.toString() },
    });

    return task ? this.toDomain(task) : null;
  }

  async findMany(params: FindTasksParams): Promise<{ data: Task[]; total: number }> {
    const where = {
      ...(params.projectId && { projectId: params.projectId }),
      ...(params.status && { status: params.status }),
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: params.offset || 0,
        take: params.limit || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks.map(task => this.toDomain(task)),
      total,
    };
  }

  async update(id: TaskId, updates: TaskUpdateData): Promise<Task> {
    const updated = await this.prisma.task.update({
      where: { id: id.toString() },
      data: {
        ...(updates.status && { status: updates.status }),
        ...(updates.completedAt && { completedAt: updates.completedAt }),
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: TaskId): Promise<void> {
    await this.prisma.task.delete({
      where: { id: id.toString() },
    });
  }

  private toDomain(prismaTask: any): Task {
    return new Task(
      new TaskId(prismaTask.id),
      new UserPrompt(prismaTask.userPrompt),
      prismaTask.projectId,
      prismaTask.status as TaskStatus,
      prismaTask.taskType as TaskType,
      prismaTask.executionMode as ExecutionMode,
      prismaTask.createdAt,
      prismaTask.completedAt,
    );
  }
}