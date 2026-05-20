// Use case: Handle incoming Telegram webhook update
// Orchestrates domain logic, delegates I/O to ports

import { Inject, Injectable, Logger } from '@nestjs/common';
import { isValidUpdate } from '../../domain/entities/telegram-update.entity';
import { TelegramCommand } from '../../domain/value-objects/telegram-command.vo';
import { ITelegramPort, TELEGRAM_PORT } from '../ports/telegram.port';
import { ITaskIntakePort, TASK_INTAKE_PORT } from '../ports/task-intake.port';

@Injectable()
export class HandleWebhookUseCase {
  private readonly logger = new Logger(HandleWebhookUseCase.name);
  private readonly telegramPort: ITelegramPort;
  private readonly taskIntake: ITaskIntakePort;

  constructor(
    @Inject(TELEGRAM_PORT) telegramPort: ITelegramPort,
    @Inject(TASK_INTAKE_PORT) taskIntake: ITaskIntakePort,
  ) {
    this.telegramPort = telegramPort;
    this.taskIntake = taskIntake;
  }

  async execute(update: unknown): Promise<void> {
    if (!isValidUpdate(update)) {
      this.logger.warn('Invalid update received');
      return;
    }

    const { message } = update;
    if (!message?.text) {
      this.logger.debug('No text message found in update');
      return;
    }

    const chatId = message.chat.id;
    const text = message.text;
    const messageId = message.message_id;

    try {
      await this.telegramPort.sendTypingAction(chatId);

      const command = TelegramCommand.parse(text);

      if (command) {
        await this.handleCommand(chatId, command);
      } else {
        await this.handleTaskSubmission(chatId, text, messageId);
      }
    } catch (error) {
      this.logger.error(`Error processing update: ${(error as Error).message}`);
      await this.telegramPort.sendMessage(
        chatId,
        '❌ Sorry, I encountered an error processing your request. Please try again later.',
      );
    }
  }

  private async handleCommand(chatId: number, command: TelegramCommand): Promise<void> {
    this.logger.log(`Processing command: ${command.command}`);

    switch (command.command) {
      case '/start':
        await this.telegramPort.sendMessage(
          chatId,
          'Welcome to SchitzoNeuralOS! 🤖\n\nI can help you with various tasks. Send me a message or use /help to see available commands.',
        );
        break;

      case '/help':
        await this.telegramPort.sendMessage(
          chatId,
          'Available commands:\n/start - Start the bot\n/help - Show this help message\n/status - Check system status\n\nYou can also send me any message and I\'ll create a task from it.',
        );
        break;

      case '/status':
        await this.telegramPort.sendMessage(
          chatId,
          '✅ System is operational\n🤖 SchitzoNeuralOS Core is running',
        );
        break;

      default:
        await this.telegramPort.sendMessage(
          chatId,
          `Unknown command: ${command.command}\n\nUse /help to see available commands.`,
        );
    }
  }

  private async handleTaskSubmission(chatId: number, text: string, messageId?: number): Promise<void> {
    this.logger.log(`Submitting task from chat ${chatId}`);

    const result = await this.taskIntake.submit({
      userPrompt: text,
      sourceType: 'telegram',
      sourceChatId: chatId,
      sourceMessageId: messageId,
    });

    await this.telegramPort.sendMessage(
      chatId,
      `📋 Task created!\n\nID: \`${result.taskId}\`\nStatus: ${result.status}\n\nI'll process this and get back to you.`,
    );
  }
}
