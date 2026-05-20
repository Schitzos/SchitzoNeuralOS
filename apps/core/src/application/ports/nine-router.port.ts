// Port: 9Router — defines the contract for LLM model calls

export const NINE_ROUTER_PORT = Symbol('NINE_ROUTER_PORT');

export interface ChatOptions {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  rtk?: boolean;
  caveman?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  id: string;
  content: string;
  model: string;
  providerRoute: string;
  inputTokens: number;
  outputTokens: number;
}

export interface INineRouterPort {
  chat(options: ChatOptions): Promise<ChatResult>;
}
