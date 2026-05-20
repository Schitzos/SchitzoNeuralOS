import React, { useState, useCallback } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { Header } from './Header.js';
import { MessageList } from './MessageList.js';
import { InputBar } from './InputBar.js';
import { StatusBar } from './StatusBar.js';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: { input: number; output: number };
}

export function App() {
  const { exit } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'Welcome to SchitzoNeuralOS CLI. Type a message to create a task, or use /help for commands.',
      timestamp: new Date(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }
  });

  const handleSubmit = useCallback(async (input: string) => {
    if (!input.trim()) return;

    // Handle commands
    if (input.startsWith('/')) {
      await handleCommand(input.trim());
      return;
    }

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // TODO: Wire to Schitzo Core API in PHASE-1.12
      const response = await simulateResponse(input);

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        model: response.model,
        tokens: response.tokens,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `Error: ${(error as Error).message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleCommand = async (cmd: string) => {
    const parts = cmd.split(' ');
    const command = parts[0];

    switch (command) {
      case '/help':
        setMessages((prev) => [...prev, {
          id: `sys-${Date.now()}`,
          role: 'system',
          content: [
            'Available commands:',
            '  /help     — Show this help message',
            '  /status   — Check system status',
            '  /clear    — Clear message history',
            '  /model    — Show current model',
            '  /connect  — Connect to Schitzo Core',
            '  /quit     — Exit the CLI',
          ].join('\n'),
          timestamp: new Date(),
        }]);
        break;

      case '/status':
        setMessages((prev) => [...prev, {
          id: `sys-${Date.now()}`,
          role: 'system',
          content: `System: ${connectionStatus}\nModel: claude-sonnet-4-20250514\nQueue: idle`,
          timestamp: new Date(),
        }]);
        break;

      case '/clear':
        setMessages([{
          id: 'cleared',
          role: 'system',
          content: 'History cleared.',
          timestamp: new Date(),
        }]);
        break;

      case '/model':
        setMessages((prev) => [...prev, {
          id: `sys-${Date.now()}`,
          role: 'system',
          content: 'Current model: claude-sonnet-4-20250514 (via 9Router)',
          timestamp: new Date(),
        }]);
        break;

      case '/connect':
        setConnectionStatus('connecting');
        setMessages((prev) => [...prev, {
          id: `sys-${Date.now()}`,
          role: 'system',
          content: 'Connecting to Schitzo Core...',
          timestamp: new Date(),
        }]);
        // TODO: Actual connection in PHASE-1.12
        setTimeout(() => {
          setConnectionStatus('connected');
          setMessages((prev) => [...prev, {
            id: `sys-${Date.now()}`,
            role: 'system',
            content: '✓ Connected to Schitzo Core (localhost:3000)',
            timestamp: new Date(),
          }]);
        }, 500);
        break;

      case '/quit':
        exit();
        break;

      default:
        setMessages((prev) => [...prev, {
          id: `sys-${Date.now()}`,
          role: 'system',
          content: `Unknown command: ${command}. Use /help for available commands.`,
          timestamp: new Date(),
        }]);
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      <Header connectionStatus={connectionStatus} />
      <MessageList messages={messages} />
      <InputBar onSubmit={handleSubmit} isProcessing={isProcessing} />
      <StatusBar connectionStatus={connectionStatus} isProcessing={isProcessing} />
    </Box>
  );
}

// Temporary simulation until PHASE-1.12 wires to Core
async function simulateResponse(input: string): Promise<{ content: string; model: string; tokens: { input: number; output: number } }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    content: `[Simulated] Task received: "${input}"\n\nThis will be processed by 9Router once connected to Schitzo Core.`,
    model: 'claude-sonnet-4-20250514',
    tokens: { input: input.length * 2, output: 50 },
  };
}
