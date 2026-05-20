// Infrastructure layer - implements ITelegramPort
// Handles actual HTTP calls to Telegram Bot API

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITelegramPort } from '../../application/ports/telegram.port';

@Injectable()
export class TelegramApiAdapter implements ITelegramPort {
  private readonly logger = new Logger(TelegramApiAdapter.name);
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.apiUrl = `https://api.telegram.org/bot${botToken}`;
  }

  async sendMessage(chatId: number, text: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Failed to send message: ${body}`);
      throw new Error(`Telegram API error: ${response.status}`);
    }

    this.logger.log(`Message sent to chat ${chatId}`);
  }

  async sendTypingAction(chatId: number): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/sendChatAction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          action: 'typing',
        }),
      });
    } catch (error) {
      this.logger.warn(`Failed to send typing action: ${(error as Error).message}`);
    }
  }
}
