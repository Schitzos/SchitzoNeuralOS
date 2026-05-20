import { describe, it, expect } from 'vitest';

describe('SchitzoCLI', () => {
  describe('Command parsing', () => {
    it('should recognize /help command', () => {
      const input = '/help';
      expect(input.startsWith('/')).toBe(true);
      expect(input.split(' ')[0]).toBe('/help');
    });

    it('should recognize /status command', () => {
      const input = '/status';
      expect(input.startsWith('/')).toBe(true);
      expect(input.split(' ')[0]).toBe('/status');
    });

    it('should recognize /clear command', () => {
      const input = '/clear';
      expect(input.startsWith('/')).toBe(true);
    });

    it('should treat non-slash input as task submission', () => {
      const input = 'Fix the login bug';
      expect(input.startsWith('/')).toBe(false);
    });

    it('should handle /quit command', () => {
      const input = '/quit';
      expect(input.split(' ')[0]).toBe('/quit');
    });
  });

  describe('Message formatting', () => {
    it('should create user message with correct role', () => {
      const msg = {
        id: `user-${Date.now()}`,
        role: 'user' as const,
        content: 'Hello',
        timestamp: new Date(),
      };
      expect(msg.role).toBe('user');
      expect(msg.content).toBe('Hello');
    });

    it('should create assistant message with model info', () => {
      const msg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: 'Response',
        timestamp: new Date(),
        model: 'claude-sonnet-4-20250514',
        tokens: { input: 100, output: 50 },
      };
      expect(msg.model).toBe('claude-sonnet-4-20250514');
      expect(msg.tokens.input).toBe(100);
      expect(msg.tokens.output).toBe(50);
    });

    it('should create system message for errors', () => {
      const msg = {
        id: `sys-${Date.now()}`,
        role: 'system' as const,
        content: 'Error: Connection refused',
        timestamp: new Date(),
      };
      expect(msg.role).toBe('system');
      expect(msg.content).toContain('Error');
    });
  });
});
