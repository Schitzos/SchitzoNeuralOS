import { describe, it, expect } from 'vitest';
import { canTransition, isTerminalState } from './index';

describe('Workflow State Machine', () => {
  it('allows valid transitions', () => {
    expect(canTransition('pending', 'queued')).toBe(true);
    expect(canTransition('running', 'success')).toBe(true);
    expect(canTransition('success', 'done')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransition('pending', 'done')).toBe(false);
    expect(canTransition('done', 'running')).toBe(false);
  });

  it('identifies terminal states', () => {
    expect(isTerminalState('done')).toBe(true);
    expect(isTerminalState('cancelled')).toBe(true);
    expect(isTerminalState('running')).toBe(false);
  });
});
