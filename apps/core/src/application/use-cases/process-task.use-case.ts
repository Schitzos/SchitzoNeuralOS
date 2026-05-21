// Use case: Process a task by making a model call via 9Router
// This is the core "thinking" step — takes a task and gets an LLM response

import { Inject, Injectable, Logger } from '@nestjs/common';
import { INineRouterPort, NINE_ROUTER_PORT, ChatResult } from '../ports/nine-router.port';
import { ITaskRepository } from '../ports/repositories.interface';
import { TaskId } from '../../domain/value-objects';
import { TaskStatus } from '../../domain/enums';

export interface ProcessTaskCommand {
  taskId: string;
  userPrompt: string;
  model?: string;
  systemPrompt?: string;
  rtk?: boolean;
  caveman?: boolean;
}

export interface ProcessTaskResult {
  taskId: string;
  response: string;
  model: string;
  providerRoute: string;
  inputTokens: number;
  outputTokens: number;
}

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_SYSTEM_PROMPT = `You are SchitzoNeuralOS, an AI agent system. You receive tasks from users and execute them. Respond with a clear, actionable plan or direct answer. Be concise and focused.`;

@Injectable()
export class ProcessTaskUseCase {
  private readonly logger = new Logger(ProcessTaskUseCase.name);
  private readonly nineRouter: INineRouterPort;
  private readonly taskRepository: ITaskRepository;

  constructor(
    @Inject(NINE_ROUTER_PORT) nineRouter: INineRouterPort,
    @Inject('ITaskRepository') taskRepository: ITaskRepository,
  ) {
    this.nineRouter = nineRouter;
    this.taskRepository = taskRepository;
  }

  async execute(command: ProcessTaskCommand): Promise<ProcessTaskResult> {
    const { taskId, userPrompt, model, systemPrompt, rtk, caveman } = command;

    this.logger.log(`Processing task ${taskId} with model ${model || DEFAULT_MODEL}`);

    // Update task status to running
    const id = new TaskId(taskId);
    await this.taskRepository.update(id, { status: TaskStatus.RUNNING });

    try {
      const result: ChatResult = await this.nineRouter.chat({
        model: model || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        rtk: rtk ?? true,
        caveman: caveman ?? true,
      });

      // Update task status to success
      await this.taskRepository.update(id, {
        status: TaskStatus.SUCCESS,
        completedAt: new Date(),
      });

      this.logger.log(
        `Task ${taskId} completed. Tokens: ${result.inputTokens}in/${result.outputTokens}out`,
      );

      return {
        taskId,
        response: result.content,
        model: result.model,
        providerRoute: result.providerRoute,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      };
    } catch (error) {
      // Update task status to failed
      await this.taskRepository.update(id, { status: TaskStatus.FAILED });

      this.logger.error(`Task ${taskId} failed: ${(error as Error).message}`);
      throw error;
    }
  }
}
