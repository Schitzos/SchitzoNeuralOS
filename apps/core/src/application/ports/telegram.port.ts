// Application port - interface that infrastructure must implement
// Inner layer defines the contract, outer layer implements it (Dependency Inversion)

export interface ITelegramPort {
  sendMessage(chatId: number, text: string): Promise<void>;
  sendTypingAction(chatId: number): Promise<void>;
}

export const TELEGRAM_PORT = Symbol('ITelegramPort');
