import React from 'react';
import { Box, Text } from 'ink';
import { Message } from './App.js';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const visibleMessages = messages.slice(-20); // Show last 20 messages

  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
      {visibleMessages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
    </Box>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const { role, content, timestamp, model, tokens } = message;

  const roleConfig = {
    user: { prefix: '❯', color: 'green' as const, label: 'you' },
    assistant: { prefix: '◆', color: 'magenta' as const, label: 'schitzo' },
    system: { prefix: '●', color: 'gray' as const, label: 'system' },
  }[role];

  const time = timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color={roleConfig.color} bold>
          {roleConfig.prefix} {roleConfig.label}
        </Text>
        <Text color="gray"> {time}</Text>
        {model && <Text color="gray" dimColor> [{model}]</Text>}
        {tokens && <Text color="gray" dimColor> ({tokens.input}↑ {tokens.output}↓)</Text>}
      </Box>
      <Box paddingLeft={2}>
        <Text wrap="wrap">{content}</Text>
      </Box>
    </Box>
  );
}
