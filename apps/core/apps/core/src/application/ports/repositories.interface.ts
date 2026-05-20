import { Task } from '../../domain/entities/task.entity';
import { TaskId } from '../../domain/value-objects';
import { TaskStatus } from '../../domain/enums';

export interface ITaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: TaskId): Promise<Task | null>;
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findByProjectId(projectId: string): Promise<Task[]>;
  update(task: Task): Promise<Task>;
  delete(id: TaskId): Promise<void>;
  findAll(options?: {
    page?: number;
    pageSize?: number;
    projectId?: string;
    status?: TaskStatus;
  }): Promise<{
    data: Task[];
    total: number;
    page: number;
    pageSize: number;
  }>;
}

export interface IAgentRepository {
  create(agent: any): Promise<any>;
  findByName(name: string): Promise<any | null>;
  findAll(): Promise<any[]>;
  update(agent: any): Promise<any>;
  delete(name: string): Promise<void>;
}

export interface IModelPricingRepository {
  findByModel(model: string): Promise<any | null>;
  findAll(): Promise<any[]>;
  create(pricing: any): Promise<any>;
  update(pricing: any): Promise<any>;
}