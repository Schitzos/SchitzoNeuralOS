// Domain entity - pure business logic, no framework dependencies

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export function isValidUpdate(update: unknown): update is TelegramUpdate {
  if (!update || typeof update !== 'object') {
    return false;
  }

  const obj = update as Record<string, unknown>;

  if (typeof obj.update_id !== 'number') {
    return false;
  }

  if (!obj.message || typeof obj.message !== 'object') {
    return false;
  }

  const message = obj.message as Record<string, unknown>;

  if (!message.from || typeof message.from !== 'object') {
    return false;
  }

  const from = message.from as Record<string, unknown>;

  if (typeof from.id !== 'number') {
    return false;
  }

  return true;
}
