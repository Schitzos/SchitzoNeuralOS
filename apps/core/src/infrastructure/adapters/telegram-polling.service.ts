// Infrastructure: Telegram Long Polling Service
// Fetches updates from Telegram API and routes them through HandleWebhookUseCase
// Used for local development (no public URL needed)

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandleWebhookUseCase } from '../../application/use-cases/handle-webhook.use-case';

@Injectable()
export class TelegramPollingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramPollingService.name);
  private readonly apiUrl: string;
  private readonly allowedUserIds: Set<string>;
  private offset = 0;
  private isRunning = false;
  private pollTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly handleWebhook: HandleWebhookUseCase,
  ) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.apiUrl = `https://api.telegram.org/bot${botToken}`;

    const allowedIds = this.configService.get<string>('TELEGRAM_ALLOWED_USER_IDS', '');
    this.allowedUserIds = new Set(allowedIds.split(',').map((id) => id.trim()).filter(Boolean));
  }

  async onModuleInit() {
    // Delete any existing webhook so polling works
    await this.deleteWebhook();
    this.isRunning = true;
    this.logger.log('Telegram polling started');
    this.poll();
  }

  onModuleDestroy() {
    this.isRunning = false;
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
    }
    this.logger.log('Telegram polling stopped');
  }

  private async deleteWebhook(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/deleteWebhook`, { method: 'POST' });
      if (response.ok) {
        this.logger.log('Webhook deleted — polling mode active');
      }
    } catch (error) {
      this.logger.warn(`Failed to delete webhook: ${(error as Error).message}`);
    }
  }

  private async poll(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const response = await fetch(
        `${this.apiUrl}/getUpdates?offset=${this.offset}&timeout=30&allowed_updates=["message"]`,
      );

      if (!response.ok) {
        this.logger.error(`Polling error: ${response.status} ${response.statusText}`);
        this.scheduleNext(5000);
        return;
      }

      const data = (await response.json()) as { ok: boolean; result: Array<{ update_id: number; message?: { from?: { id: number } } }> };

      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          this.offset = update.update_id + 1;

          // Check if user is allowed
          const userId = update.message?.from?.id?.toString();
          if (userId && !this.allowedUserIds.has(userId)) {
            this.logger.warn(`Ignoring message from unauthorized user: ${userId}`);
            continue;
          }

          try {
            await this.handleWebhook.execute(update);
          } catch (error) {
            this.logger.error(`Error handling update ${update.update_id}: ${(error as Error).message}`);
          }
        }
      }

      this.scheduleNext(100); // Quick re-poll after messages
    } catch (error) {
      this.logger.error(`Polling fetch error: ${(error as Error).message}`);
      this.scheduleNext(5000); // Back off on error
    }
  }

  private scheduleNext(delay: number): void {
    if (!this.isRunning) return;
    this.pollTimeout = setTimeout(() => this.poll(), delay);
  }
}
