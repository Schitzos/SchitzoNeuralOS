import { Controller, Get, Post, Put, Param, Body, Query, ValidationPipe } from '@nestjs/common';
import { CreateTaskUseCase, UpdateTaskStatusUseCase, GetTaskUseCase, ListTasksUseCase } from '../../application/use-cases/task.use-cases';
import { CreateTaskDto, UpdateTaskStatusDto, TaskResponseDto, TaskListResponseDto } from '../dto/task.dto';
import { TaskStatus } from '../../domain/enums';
import { Task } from '../../domain/entities/task.entity';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
  ) {}

  @Post()
  async createTask(@Body(ValidationPipe) createTaskDto: CreateTaskDto): Promise<TaskResponseDto> {
    const task = await this.createTaskUseCase.execute({
      userPrompt: createTaskDto.userPrompt,
      projectId: createTaskDto.projectId,
      taskType: createTaskDto.taskType,
      executionMode: createTaskDto.executionMode,
    });

    return this.toResponseDto(task);
  }

  @Get(':id')
  async getTask(@Param('id') id: string): Promise<TaskResponseDto | null> {
    const task = await this.getTaskUseCase.execute(id);
    return task ? this.toResponseDto(task) : null;
  }

  @Get()
  async listTasks(
    @Query('projectId') projectId?: string,
    @Query('status') status?: TaskStatus,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<TaskListResponseDto> {
    const result = await this.listTasksUseCase.execute({
      projectId,
      status,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });

    return {
      data: result.data.map(task => this.toResponseDto(task)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  @Put(':id/status')
  async updateTaskStatus(
    @Param('id') id: string,
    @Body(ValidationPipe) updateStatusDto: UpdateTaskStatusDto,
  ): Promise<TaskResponseDto> {
    const task = await this.updateTaskStatusUseCase.execute(id, updateStatusDto.status);
    return this.toResponseDto(task);
  }

  private toResponseDto(task: Task): TaskResponseDto {
    return {
      id: task.id.toString(),
      userPrompt: task.userPrompt.toString(),
      projectId: task.projectId,
      status: task.status,
      taskType: task.taskType,
      executionMode: task.executionMode,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      duration: task.getDuration(),
    };
  }
}
