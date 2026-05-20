import { describe, it, expect } from 'vitest';
import { TaskId, AgentName, UserPrompt } from './index';

describe('TaskId', () => {
  it('should create valid TaskId', () => {
    const taskId = new TaskId('task-123');
    expect(taskId.toString()).toBe('task-123');
  });

  it('should throw error for empty TaskId', () => {
    expect(() => new TaskId('')).toThrow('TaskId cannot be empty');
    expect(() => new TaskId('   ')).toThrow('TaskId cannot be empty');
  });

  it('should compare TaskIds correctly', () => {
    const taskId1 = new TaskId('task-123');
    const taskId2 = new TaskId('task-123');
    const taskId3 = new TaskId('task-456');

    expect(taskId1.equals(taskId2)).toBe(true);
    expect(taskId1.equals(taskId3)).toBe(false);
  });
});

describe('AgentName', () => {
  it('should create valid AgentName', () => {
    const agentName = new AgentName('BE');
    expect(agentName.toString()).toBe('BE');
  });

  it('should accept 2-4 uppercase letters', () => {
    expect(() => new AgentName('BE')).not.toThrow();
    expect(() => new AgentName('ARC')).not.toThrow();
    expect(() => new AgentName('EVAL')).not.toThrow();
  });

  it('should throw error for invalid AgentName', () => {
    expect(() => new AgentName('be')).toThrow('AgentName must be 2-4 uppercase letters');
    expect(() => new AgentName('B')).toThrow('AgentName must be 2-4 uppercase letters');
    expect(() => new AgentName('TOOLONG')).toThrow('AgentName must be 2-4 uppercase letters');
    expect(() => new AgentName('B3')).toThrow('AgentName must be 2-4 uppercase letters');
  });

  it('should compare AgentNames correctly', () => {
    const agent1 = new AgentName('BE');
    const agent2 = new AgentName('BE');
    const agent3 = new AgentName('QA');

    expect(agent1.equals(agent2)).toBe(true);
    expect(agent1.equals(agent3)).toBe(false);
  });
});

describe('UserPrompt', () => {
  it('should create valid UserPrompt', () => {
    const prompt = new UserPrompt('Implement user authentication');
    expect(prompt.toString()).toBe('Implement user authentication');
  });

  it('should throw error for empty UserPrompt', () => {
    expect(() => new UserPrompt('')).toThrow('UserPrompt cannot be empty');
    expect(() => new UserPrompt('   ')).toThrow('UserPrompt cannot be empty');
  });

  it('should throw error for too long UserPrompt', () => {
    const longPrompt = 'a'.repeat(10001);
    expect(() => new UserPrompt(longPrompt)).toThrow('UserPrompt cannot exceed 10000 characters');
  });

  it('should truncate correctly', () => {
    const prompt = new UserPrompt('This is a long prompt');
    expect(prompt.truncate(10)).toBe('This is...');
    expect(prompt.truncate(50)).toBe('This is a long prompt');
  });
});