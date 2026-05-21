import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HandleWebhookUseCase } from '../application/use-cases/handle-webhook.use-case';
import { TaskIntakeUseCase } from '../application/use-cases/task-intake.use-case';
import { ProcessTaskUseCase } from '../application/use-cases/process-task.use-case';
import { SendTelegramResponseUseCase } from '../application/use-cases/send-telegram-response.use-case';
import { HandleStatusCommandUseCase } from '../application/use-cases/handle-status-command.use-case';
import { TaskStatusTracker } from '../domain/services/task-status-tracker.service';
import { TaskStatus } from '../domain/enums';

/**
 * End-to-end control loop test
 * Verifies the full flow: Telegram → Intake → Queue → Process → Response
 */
describe('End-to-End Control Loop', () => {
  // Mocks
  let mockTelegramPort: {
    sendMessage: ReturnType<typeof vi.fn>;
    sendTypingAction: ReturnType<typeof vi.fn>;
  };
  let mockTaskRepository: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let mockNineRouter: { chat: ReturnType<typeof vi.fn> };
  let mockJobQueue: {
    addJob: ReturnType<typeof vi.fn>;
    getJobStatus: ReturnType<typeof vi.fn>;
  };

  // Use cases
  let handleWebhook: HandleWebhookUseCase;
  let taskIntake: TaskIntakeUseCase;
  let processTask: ProcessTaskUseCase;
  let sendResponse: SendTelegramResponseUseCase;
  let statusCommand: HandleStatusCommandUseCase;
  let statusTracker: TaskStatusTracker;

  beforeEach(() => {
    mockTelegramPort = {
      sendMessage: vi.fn().mockResolvedValue(undefined),
      sendTypingAction: vi.fn().mockResolvedValue(undefined),
    };

    mockTaskRepository = {
      create: vi.fn().mockImplementation((task) => Promise.resolve(task)),
      findById: vi.fn(),
      findMany: vi.fn().mockResolvedValue({ data: [], total: 0 }),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn(),
    };

    mockNineRouter = {
      chat: vi.fn().mockResolvedValue({
        id: 'resp-e2e',
        content: 'Here is the solution to your problem.',
        model: 'claude-sonnet-4-20250514',
        providerRoute: 'anthropic/claude-sonnet-4-20250514',
        inputTokens: 250,
        outputTokens: 180,
      }),
    };

    mockJobQueue = {
      addJob: vi.fn().mockResolvedValue({ id: 'job-123' }),
      getJobStatus: vi.fn().mockResolvedValue({ status: 'completed' }),
    };

    statusTracker = new TaskStatusTracker();

    taskIntake = new TaskIntakeUseCase(mockTaskRepository);
    processTask = new ProcessTaskUseCase(mockNineRouter, mockTaskRepository);
    sendResponse = new SendTelegramResponseUseCase(mockTelegramPort);
    statusCommand = new HandleStatusCommandUseCase(mockTelegramPort, mockTaskRepository, mockJobQueue);
    handleWebhook = new HandleWebhookUseCase(mockTelegramPort, taskIntake, statusCommand);
  });

  describe('Full task lifecycle', () => {
    it('should process a user message through the entire control loop', async () => {
      // Step 1: User sends a message via Telegram webhook
      const telegramUpdate = {
        update_id: 123456,
        message: {
          message_id: 1,
          chat: { id: 1845486925, type: 'private' },
          from: { id: 1845486925, is_bot: false, first_name: 'User' },
          text: 'Fix the authentication bug in the login service',
          date: Math.floor(Date.now() / 1000),
        },
      };

      // Step 1: Webhook receives and creates task
      await handleWebhook.execute(telegramUpdate);

      // Verify typing action was sent
      expect(mockTelegramPort.sendTypingAction).toHaveBeenCalledWith(1845486925);

      // Verify task was created
      expect(mockTaskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userPrompt: expect.objectContaining({}),
        }),
      );

      // Verify confirmation was sent
      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        1845486925,
        expect.stringContaining('Task created'),
      );

      // Step 2: Simulate queue processing — ProcessTaskUseCase
      const taskId = 'task-e2e-123';
      const processResult = await processTask.execute({
        taskId,
        userPrompt: 'Fix the authentication bug in the login service',
      });

      // Verify 9Router was called
      expect(mockNineRouter.chat).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-sonnet-4-20250514',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: 'Fix the authentication bug in the login service' }),
          ]),
        }),
      );

      // Verify task status was updated to RUNNING then SUCCESS
      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: TaskStatus.RUNNING }),
      );
      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: TaskStatus.SUCCESS }),
      );

      // Step 3: Send response back to user
      await sendResponse.execute({
        chatId: 1845486925,
        taskId,
        type: 'task_completed',
        content: processResult.response,
        model: processResult.model,
        inputTokens: processResult.inputTokens,
        outputTokens: processResult.outputTokens,
      });

      // Verify completion message was sent
      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        1845486925,
        expect.stringContaining('Task Completed'),
      );
      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        1845486925,
        expect.stringContaining('Here is the solution to your problem.'),
      );
    });

    it('should handle task failure gracefully', async () => {
      mockNineRouter.chat.mockRejectedValue(new Error('Model overloaded'));

      const taskId = 'task-fail-e2e';

      // Process should throw
      await expect(
        processTask.execute({
          taskId,
          userPrompt: 'Do something complex',
        }),
      ).rejects.toThrow('Model overloaded');

      // Task should be marked as failed
      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: TaskStatus.FAILED }),
      );

      // Send failure response
      await sendResponse.execute({
        chatId: 1845486925,
        taskId,
        type: 'task_failed',
        error: 'Model overloaded',
      });

      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        1845486925,
        expect.stringContaining('Task Failed'),
      );
      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        1845486925,
        expect.stringContaining('Model overloaded'),
      );
    });

    it('should handle /status command end-to-end', async () => {
      const statusUpdate = {
        update_id: 123457,
        message: {
          message_id: 2,
          chat: { id: 1845486925, type: 'private' },
          from: { id: 1845486925, is_bot: false, first_name: 'User' },
          text: '/status',
          date: Math.floor(Date.now() / 1000),
        },
      };

      await handleWebhook.execute(statusUpdate);

      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        1845486925,
        expect.stringContaining('SchitzoNeuralOS Status'),
      );
    });

    it('should track status transitions through the lifecycle', () => {
      const taskId = 'task-lifecycle';

      // Full lifecycle
      statusTracker.transition(taskId, TaskStatus.PENDING, TaskStatus.QUEUED);
      statusTracker.transition(taskId, TaskStatus.QUEUED, TaskStatus.RUNNING);
      statusTracker.transition(taskId, TaskStatus.RUNNING, TaskStatus.SUCCESS);

      const history = statusTracker.getHistory(taskId);
      expect(history).toHaveLength(3);
      expect(history[0].to).toBe(TaskStatus.QUEUED);
      expect(history[1].to).toBe(TaskStatus.RUNNING);
      expect(history[2].to).toBe(TaskStatus.SUCCESS);
      expect(statusTracker.isTerminal(TaskStatus.SUCCESS)).toBe(true);
    });

    it('should handle retry flow after failure', () => {
      const taskId = 'task-retry';

      statusTracker.transition(taskId, TaskStatus.PENDING, TaskStatus.QUEUED);
      statusTracker.transition(taskId, TaskStatus.QUEUED, TaskStatus.RUNNING);
      statusTracker.transition(taskId, TaskStatus.RUNNING, TaskStatus.FAILED, 'Timeout');

      // Retry
      statusTracker.transition(taskId, TaskStatus.FAILED, TaskStatus.PENDING, 'User retry');

      const history = statusTracker.getHistory(taskId);
      expect(history).toHaveLength(4);
      expect(history[3].to).toBe(TaskStatus.PENDING);
      expect(history[3].reason).toBe('User retry');
    });
  });
});
