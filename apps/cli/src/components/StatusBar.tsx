import React from 'react';
import { Box, Text } from 'ink';

interface StatusBarProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  isProcessing: boolean;
}

export function StatusBar({ connectionStatus, isProcessing }: StatusBarProps) {
  return (
    <Box paddingX={1} justifyContent="space-between">
      <Text color="gray" dimColor>
        ctrl+c to exit | /help for commands
      </Text>
      <Box>
        {isProcessing && <Text color="yellow">⟳ processing </Text>}
        <Text color="gray" dimColor>
          model: claude-sonnet-4-20250514
        </Text>
      </Box>
    </Box>
  );
}
