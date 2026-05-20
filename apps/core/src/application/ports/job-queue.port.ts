// Port: Job Queue — defines the contract for async task processing

export const JOB_QUEUE_PORT = Symbol('JOB_QUEUE_PORT');

export interface JobData {
  taskId: string;
  userPrompt: string;
  taskType: string;
  projectId: string;
  sourceType: string;
  sourceChatId?: number;
}

export interface JobResult {
  jobId: string;
  status: 'queued' | 'active' | 'completed' | 'failed';
}

export interface IJobQueuePort {
  addJob(data: JobData): Promise<JobResult>;
  getJobStatus(jobId: string): Promise<JobResult | null>;
}
