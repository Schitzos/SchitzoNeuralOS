// Use case: Send task processing results back to the user via Telegram
// Formats responses based on task outcome (success, failure, status updates)

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITelegramPort, TELEGRAM_PORT } from '../ports/telegram.port';

export interface SendResponseCommand {
  chatId: number;
  taskId: string;
  type: ResponseType;
  content?: string;
  error?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export type ResponseType = 'task_started' | 'task_completed' | 'task_failed' | 'task_status';

@Injectable()
export class SendTelegramResponseUseCase {
  private readonly logger = new Logger(SendTelegramResponseUseCase.name);
  private readonly telegramPort: ITelegramPort;

  constructor(
    @Inject(TELEGRAM_PORT) telegramPort: ITelegramPort,
  ) {
    this.telegramPort = telegramPort;
  }

  async execute(command: SendResponseCommand): Promise<void> {
    const message = this.formatMessage(command);

    this.logger.log(`Sending ${command.type} response to chat ${command.chatId} for task ${command.taskId}`);

    await this.telegramPort.sendMessage(command.chatId, message);
  }

  private formatMessage(command: SendResponseCommand): string {
    switch (command.type) {
      case 'task_started':
        return this.formatTaskStarted(command);
      case 'task_completed':
        return this.formatTaskCompleted(command);
      case 'task_failed':
        return this.formatTaskFailed(command);
      case 'task_status':
        return this.formatTaskStatus(command);
      default:
        return `Task ${command.taskId}: Unknown response type`;
    }
  }

  private formatTaskStarted(command: SendResponseCommand): string {
    return [
      `⚙️ *Task Processing*`,
      ``,
      `ID: \`${command.taskId}\``,
      `Status: Running`,
      command.model ? `Model: ${command.model}` : '',
      ``,
      `I'm working on your request...`,
    ].filter(Boolean).join('\n');
  }

  private formatTaskCompleted(command: SendResponseCommand): string {
    const tokenInfo = command.inputTokens && command.outputTokens
      ? `\n📊 Tokens: ${command.inputTokens}in / ${command.outputTokens}out`
      : '';

    return [
      `✅ *Task Completed*`,
      ``,
      `ID: \`${command.taskId}\``,
      command.model ? `Model: ${command.model}` : '',
      tokenInfo,
      ``,
      `---`,
      ``,
      command.content || 'Task completed successfully.',
    ].filter(Boolean).join('\n');
  }

  private formatTaskFailed(command: SendResponseCommand): string {
    return [
      `❌ *Task Failed*`,
      ``,
      `ID: \`${command.taskId}\``,
      `Error: ${command.error || 'Unknown error'}`,
      ``,
      `Please try again or use /status to check system health.`,
    ].join('\n');
  }

  private formatTaskStatus(command: SendResponseCommand): string {
    return [
      `📋 *Task Status*`,
      ``,
      `ID: \`${command.taskId}\``,
      command.content || 'No status information available.',
    ].join('\n');
  }
}
