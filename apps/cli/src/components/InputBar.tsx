import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface InputBarProps {
  onSubmit: (input: string) => void;
  isProcessing: boolean;
}

export function InputBar({ onSubmit, isProcessing }: InputBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (input: string) => {
    if (isProcessing) return;
    onSubmit(input);
    setValue('');
  };

  return (
    <Box borderStyle="single" borderColor={isProcessing ? 'yellow' : 'green'} paddingX={1}>
      <Text color={isProcessing ? 'yellow' : 'green'} bold>
        {isProcessing ? '⟳ ' : '❯ '}
      </Text>
      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        placeholder={isProcessing ? 'Processing...' : 'Type a message or /help'}
      />
    </Box>
  );
}
