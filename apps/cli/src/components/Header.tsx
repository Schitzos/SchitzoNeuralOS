import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export function Header({ connectionStatus }: HeaderProps) {
  const statusColor = {
    connected: 'green',
    disconnected: 'red',
    connecting: 'yellow',
  }[connectionStatus] as 'green' | 'red' | 'yellow';

  const statusIcon = {
    connected: '●',
    disconnected: '○',
    connecting: '◐',
  }[connectionStatus];

  return (
    <Box borderStyle="single" borderColor="cyan" paddingX={1} justifyContent="space-between">
      <Text bold color="cyan">
        SchitzoNeuralOS
      </Text>
      <Text color={statusColor}>
        {statusIcon} {connectionStatus}
      </Text>
    </Box>
  );
}
