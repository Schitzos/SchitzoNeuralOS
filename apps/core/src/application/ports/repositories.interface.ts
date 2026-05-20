import { Task } from '../../domain/entities/task.entity';
import { TaskId } from '../../domain/value-objects';
import { TaskStatus } from '../../domain/enums';

export interface ITaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: TaskId): Promise<Task | null>;
  findMany(params: FindTasksParams): Promise<{ data: Task[]; total: number }>;
  update(id: TaskId, updates: Partial<TaskUpdateData>): Promise<Task>;
  delete(id: TaskId): Promise<void>;
}

export interface FindTasksParams {
  projectId?: string;
  status?: TaskStatus;
  offset?: number;
  limit?: number;
}

export interface TaskUpdateData {
  status?: TaskStatus;
  completedAt?: Date;
}

export interface IAgentRepository {
  findByName(name: string): Promise<AgentData | null>;
  findAll(): Promise<AgentData[]>;
  create(agent: AgentData): Promise<AgentData>;
  update(name: string, updates: Partial<AgentData>): Promise<AgentData>;
}

export interface AgentData {
  name: string;
  description: string;
  prompt: string;
  status: string;
  agentType: string;
  allowedTools: string[];
  capabilityPolicy: Record<string, any>;
  keyboardShortcut?: string;
  welcomeMessage?: string;
}

export interface IModelPricingRepository {
  findPricing(provider: string, model: string): Promise<ModelPricingData | null>;
  createPricing(pricing: ModelPricingData): Promise<ModelPricingData>;
}

export interface ModelPricingData {
  provider: string;
  model: string;
  inputPricePer1mTokens: number;
  outputPricePer1mTokens: number;
  effectiveDate: Date;
  pricingVersion: string;
}