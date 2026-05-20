// Task
export type TaskStatus = 'pending' | 'queued' | 'running' | 'waiting_approval' | 'retrying' | 'success' | 'failed' | 'blocked' | 'done' | 'cancelled' | 'archived';
export type TaskType = 'feature' | 'bug' | 'refactor' | 'chore' | 'research';
export type Difficulty = 'simple' | 'medium' | 'complex' | 'critical';
export type ExecutionMode = 'single' | 'compare' | 'fallback';

// Workflow
export type WorkflowNodeStatus = 'pending' | 'running' | 'success' | 'failed' | 'waiting_approval' | 'retrying' | 'skipped' | 'cancelled' | 'blocked';

// Agent
export type AgentRunStatus = 'running' | 'success' | 'failed' | 'cancelled';

// Tool
export type RiskLevel = 'safe' | 'controlled' | 'high_risk';
export type ToolCallStatus = 'pending' | 'running' | 'success' | 'failed' | 'blocked';

// Error taxonomy
export type ErrorType = 'provider_error' | 'model_error' | 'tool_error' | 'validation_error' | 'policy_error' | 'approval_error' | 'workflow_error' | 'infrastructure_error' | 'git_error' | 'unknown_error';

// Autonomy
export type AutonomyLevel = 'advisory' | 'supervised' | 'semi_autonomous' | 'autonomous';

// Board columns
export type BoardColumn = 'backlog' | 'todo' | 'in_progress' | 'qa_review' | 'done' | 'failed' | 'blocked';

// Interfaces
export interface Task {
  id: string;
  projectId: string;
  userPrompt: string;
  taskType: TaskType;
  difficulty: Difficulty;
  status: TaskStatus;
  executionMode: ExecutionMode;
  githubIssueId?: string;
  githubProjectItemId?: string;
  hermesKanbanCardId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  path: string;
  gitRemoteUrl?: string;
  githubRepo?: string;
  githubProjectId?: string;
  hermesKanbanBoardId?: string;
  defaultBranch: string;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRun {
  id: string;
  taskId: string;
  agentName: string;
  modelName: string;
  providerRoute: string;
  status: AgentRunStatus;
  inputTokens: number;
  outputTokens: number;
  rtkEnabled: boolean;
  cavemanEnabled: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface ToolCall {
  id: string;
  taskId: string;
  agentRunId: string;
  toolName: string;
  command: string;
  status: ToolCallStatus;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  approvedByUser?: boolean;
  stdout?: string;
  stderr?: string;
  createdAt: Date;
}

export interface ModelUsage {
  id: string;
  taskId: string;
  agentRunId: string;
  modelName: string;
  providerRoute: string;
  inputTokens: number;
  outputTokens: number;
  pricingVersion: string;
  estimatedCost: number;
  createdAt: Date;
}

export interface ApprovalRequest {
  id: string;
  taskId: string;
  workflowRunId: string;
  agentName: string;
  requestedAction: string;
  riskLevel: RiskLevel;
  commandPreview: string;
  requestedAt: Date;
  timeoutAt: Date;
  decision?: 'approved' | 'rejected';
  decidedAt?: Date;
}
