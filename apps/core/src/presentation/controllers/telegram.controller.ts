// Presentation layer - Controller handles HTTP, delegates to use case

import { Controller, Post, Body, Logger, UseGuards } from '@nestjs/common';
import { HandleWebhookUseCase } from '../../application/use-cases/handle-webhook.use-case';
import { Public } from '../decorators/public.decorator';
import { TelegramGuard } from '../guards/telegram.guard';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private readonly handleWebhookUseCase: HandleWebhookUseCase) {}

  @Public()
  @UseGuards(TelegramGuard)
  @Post('webhook')
  async handleWebhook(@Body() update: unknown): Promise<{ status: string }> {
    this.logger.log('Received Telegram webhook update');
    await this.handleWebhookUseCase.execute(update);
    return { status: 'ok' };
  }
}
