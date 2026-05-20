import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendTelegramResponseUseCase } from './send-telegram-response.use-case';

describe('SendTelegramResponseUseCase', () => {
  let useCase: SendTelegramResponseUseCase;
  let mockTelegramPort: { sendMessage: ReturnType<typeof vi.fn>; sendTypingAction: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockTelegramPort = {
      sendMessage: vi.fn().mockResolvedValue(undefined),
      sendTypingAction: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new SendTelegramResponseUseCase(mockTelegramPort);
  });

  describe('execute', () => {
    it('should send task_started message', async () => {
      await useCase.execute({
        chatId: 12345,
        taskId: 'task-123',
        type: 'task_started',
        model: 'claude-sonnet-4-20250514',
      });

      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('Task Processing'),
      );
      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('task-123'),
      );
      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('claude-sonnet-4-20250514'),
      );
    });

    it('should send task_completed message with content', async () => {
      await useCase.execute({
        chatId: 12345,
        taskId: 'task-456',
        type: 'task_completed',
        content: 'Here is the solution to your problem.',
        model: 'claude-sonnet-4-20250514',
        inputTokens: 200,
        outputTokens: 150,
      });

      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('Task Completed'),
      );
      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('Here is the solution to your problem.'),
      );
      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('200in / 150out'),
      );
    });

    it('should send task_failed message with error', async () => {
      await useCase.execute({
        chatId: 12345,
        taskId: 'task-789',
        type: 'task_failed',
        error: 'Model unavailable',
      });

      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('Task Failed'),
      );
      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('Model unavailable'),
      );
    });

    it('should send task_status message', async () => {
      await useCase.execute({
        chatId: 12345,
        taskId: 'task-status',
        type: 'task_status',
        content: 'Status: running (2 minutes elapsed)',
      });

      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('Task Status'),
      );
      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('Status: running (2 minutes elapsed)'),
      );
    });

    it('should handle task_completed without token info', async () => {
      await useCase.execute({
        chatId: 12345,
        taskId: 'task-no-tokens',
        type: 'task_completed',
        content: 'Done.',
      });

      const message = mockTelegramPort.sendMessage.mock.calls[0][1];
      expect(message).not.toContain('Tokens:');
      expect(message).toContain('Done.');
    });

    it('should handle task_failed without error message', async () => {
      await useCase.execute({
        chatId: 12345,
        taskId: 'task-no-error',
        type: 'task_failed',
      });

      expect(mockTelegramPort.sendMessage).toHaveBeenCalledWith(
        12345,
        expect.stringContaining('Unknown error'),
      );
    });
  });
});
