import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { Header } from './Header.js';
import { MessageList } from './MessageList.js';
import { InputBar } from './InputBar.js';
import { StatusBar } from './StatusBar.js';
import { SchitzoCoreClient, CoreClientError } from '../api/core-client.js';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: { input: number; output: number };
}

const DEFAULT_CORE_URL = 'http://localhost:3000';

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
  const [client, setClient] = useState<SchitzoCoreClient | null>(null);

  // Auto-connect on startup
  useEffect(() => {
    connectToCore(DEFAULT_CORE_URL);
  }, []);

  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }
  });

  const connectToCore = async (url: string) => {
    setConnectionStatus('connecting');
    const newClient = new SchitzoCoreClient({ baseUrl: url, timeout: 10000 });

    try {
      await newClient.healthCheck();
      setClient(newClient);
      setConnectionStatus('connected');
      addSystemMessage(`✓ Connected to Schitzo Core (${url})`);
    } catch (error) {
      setConnectionStatus('disconnected');
      setClient(null);
      addSystemMessage(`✗ Failed to connect: ${(error as Error).message}. Use /connect <url> to retry.`);
    }
  };

  const addSystemMessage = (content: string) => {
    setMessages((prev) => [...prev, {
      id: `sys-${Date.now()}`,
      role: 'system',
      content,
      timestamp: new Date(),
    }]);
  };

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
      if (client && connectionStatus === 'connected') {
        // Real API call
        const result = await client.submitTask(input);
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `📋 Task created!\n\nID: ${result.id}\nStatus: ${result.status}\n\nProcessing your request...`,
          timestamp: new Date(),
          model: 'claude-sonnet-4-20250514',
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Poll for completion
        pollTaskStatus(result.id);
      } else {
        // Offline mode
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `[Offline] Task queued locally: "${input}"\n\nConnect to Schitzo Core with /connect to process tasks.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (error) {
      const errorContent = error instanceof CoreClientError
        ? `API Error (${error.statusCode}): ${error.message}`
        : `Error: ${(error as Error).message}`;

      setMessages((prev) => [...prev, {
        id: `error-${Date.now()}`,
        role: 'system',
        content: errorContent,
        timestamp: new Date(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [client, connectionStatus]);

  const pollTaskStatus = async (taskId: string) => {
    if (!client) return;

    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    const poll = async () => {
      attempts++;
      if (attempts > maxAttempts) {
        addSystemMessage(`Task ${taskId} is still processing. Use /task ${taskId} to check later.`);
        return;
      }

      try {
        const status = await client.getTaskStatus(taskId);

        if (status.status === 'success') {
          setMessages((prev) => [...prev, {
            id: `result-${Date.now()}`,
            role: 'assistant',
            content: `✅ Task completed!\n\nID: ${taskId}`,
            timestamp: new Date(),
            model: 'claude-sonnet-4-20250514',
          }]);
          return;
        }

        if (status.status === 'failed') {
          addSystemMessage(`❌ Task ${taskId} failed.`);
          return;
        }

        // Still processing, poll again
        setTimeout(poll, 1000);
      } catch {
        // Silently retry
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        }
      }
    };

    setTimeout(poll, 1000);
  };

  const handleCommand = async (cmd: string) => {
    const parts = cmd.split(' ');
    const command = parts[0];

    switch (command) {
      case '/help':
        addSystemMessage([
          'Available commands:',
          '  /help              — Show this help message',
          '  /status            — Check system status',
          '  /connect [url]     — Connect to Schitzo Core',
          '  /task <id>         — Check task status',
          '  /tasks             — List recent tasks',
          '  /model             — Show current model',
          '  /clear             — Clear message history',
          '  /quit              — Exit the CLI',
        ].join('\n'));
        break;

      case '/status':
        if (client && connectionStatus === 'connected') {
          try {
            const health = await client.healthCheck();
            addSystemMessage(`System: ${health.status}\nService: ${health.service}\nTime: ${health.timestamp}`);
          } catch (error) {
            addSystemMessage(`Failed to get status: ${(error as Error).message}`);
          }
        } else {
          addSystemMessage(`System: disconnected\nUse /connect to connect to Schitzo Core.`);
        }
        break;

      case '/connect': {
        const url = parts[1] || DEFAULT_CORE_URL;
        await connectToCore(url);
        break;
      }

      case '/task': {
        const taskId = parts[1];
        if (!taskId) {
          addSystemMessage('Usage: /task <task-id>');
          break;
        }
        if (!client) {
          addSystemMessage('Not connected. Use /connect first.');
          break;
        }
        try {
          const task = await client.getTaskStatus(taskId);
          addSystemMessage(`Task: ${task.id}\nStatus: ${task.status}\nPrompt: ${task.userPrompt}\nCreated: ${task.createdAt}`);
        } catch (error) {
          addSystemMessage(`Failed to get task: ${(error as Error).message}`);
        }
        break;
      }

      case '/tasks': {
        if (!client) {
          addSystemMessage('Not connected. Use /connect first.');
          break;
        }
        try {
          const result = await client.listTasks({ limit: 10 });
          if (result.data.length === 0) {
            addSystemMessage('No tasks found.');
          } else {
            const lines = result.data.map((t) => `  ${t.status.padEnd(10)} ${t.id.slice(0, 8)}… ${t.userPrompt.slice(0, 40)}`);
            addSystemMessage(`Recent tasks (${result.total} total):\n${lines.join('\n')}`);
          }
        } catch (error) {
          addSystemMessage(`Failed to list tasks: ${(error as Error).message}`);
        }
        break;
      }

      case '/model':
        addSystemMessage('Current model: claude-sonnet-4-20250514 (via 9Router)');
        break;

      case '/clear':
        setMessages([{
          id: 'cleared',
          role: 'system',
          content: 'History cleared.',
          timestamp: new Date(),
        }]);
        break;

      case '/quit':
        exit();
        break;

      default:
        addSystemMessage(`Unknown command: ${command}. Use /help for available commands.`);
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
