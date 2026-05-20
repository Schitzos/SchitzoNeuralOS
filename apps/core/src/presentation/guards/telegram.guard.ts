import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TelegramGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.body?.message?.from?.id?.toString();
    const allowed = (process.env.TELEGRAM_ALLOWED_USER_IDS || '').split(',');

    if (!userId || !allowed.includes(userId)) {
      throw new ForbiddenException('Telegram user not authorized');
    }
    return true;
  }
}
