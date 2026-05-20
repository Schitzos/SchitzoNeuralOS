import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TaskType, ExecutionMode, TaskStatus } from '../../domain/enums';

export class CreateTaskDto {
  @IsString()
  userPrompt!: string;

  @IsUUID()
  projectId!: string;

  @IsOptional()
  @IsEnum(TaskType)
  taskType?: TaskType;

  @IsOptional()
  @IsEnum(ExecutionMode)
  executionMode?: ExecutionMode;
}

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}

export class TaskResponseDto {
  id!: string;
  userPrompt!: string;
  projectId!: string;
  status!: TaskStatus;
  taskType!: TaskType;
  executionMode!: ExecutionMode;
  createdAt!: Date;
  completedAt?: Date;
  duration?: number | null;
}

export class TaskListResponseDto {
  data!: TaskResponseDto[];
  total!: number;
  page!: number;
  pageSize!: number;
}
