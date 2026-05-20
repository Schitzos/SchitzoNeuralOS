// Use case: Handle incoming Telegram webhook update
// Orchestrates domain logic, delegates I/O to ports

import { Inject, Injectable, Logger } from '@nestjs/common';
import { TelegramUpdate, isValidUpdate } from '../../domain/entities/telegram-update.entity';
import { TelegramCommand } from '../../domain/value-objects/telegram-command.vo';
import { ITelegramPort, TELEGRAM_PORT } from '../ports/telegram.port';

@Injectable()
export class HandleWebhookUseCase {
  private readonly logger = new Logger(HandleWebhookUseCase.name);
  private readonly telegramPort: ITelegramPort;

  constructor(
    @Inject(TELEGRAM_PORT) telegramPort: ITelegramPort,
  ) {
    this.telegramPort = telegramPort;
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

    try {
      await this.telegramPort.sendTypingAction(chatId);

      const command = TelegramCommand.parse(text);

      if (command) {
        await this.handleCommand(chatId, command);
      } else {
        await this.handleMessage(chatId, text);
      }
    } catch (error) {
      this.logger.error(`Error processing update: ${(error as Error).message}`);
      await this.telegramPort.sendMessage(
        chatId,
        'Sorry, I encountered an error processing your request. Please try again later.',
      );
    }
  }

  private async handleCommand(chatId: number, command: TelegramCommand): Promise<void> {
    this.logger.log(`Processing command: ${command.command}`);

    switch (command.command) {
      case '/start':
        await this.telegramPort.sendMessage(
          chatId,
          'Welcome to SchitzoNeuralOS! \u{1F916}\n\nI can help you with various tasks. Send me a message or use /help to see available commands.',
        );
        break;

      case '/help':
        await this.telegramPort.sendMessage(
          chatId,
          'Available commands:\n/start - Start the bot\n/help - Show this help message\n/status - Check system status\n\nYou can also send me any message and I\'ll try to help you with it.',
        );
        break;

      case '/status':
        await this.telegramPort.sendMessage(
          chatId,
          '\u2705 System is operational\n\u{1F916} SchitzoNeuralOS Core is running',
        );
        break;

      default:
        await this.telegramPort.sendMessage(
          chatId,
          `Unknown command: ${command.command}\n\nUse /help to see available commands.`,
        );
    }
  }

  private async handleMessage(chatId: number, text: string): Promise<void> {
    this.logger.log(`Processing message from chat ${chatId}`);

    await this.telegramPort.sendMessage(
      chatId,
      `I received your message: "${text}"\n\nI'm currently in development mode. More features coming soon! Use /help to see available commands.`,
    );
  }
}
