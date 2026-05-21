import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStatusTracker, InvalidTransitionError } from './task-status-tracker.service';
import { TaskStatus } from '../enums';

describe('TaskStatusTracker', () => {
  let tracker: TaskStatusTracker;

  beforeEach(() => {
    tracker = new TaskStatusTracker();
  });

  describe('isValidTransition', () => {
    it('should allow PENDING → QUEUED', () => {
      expect(tracker.isValidTransition(TaskStatus.PENDING, TaskStatus.QUEUED)).toBe(true);
    });

    it('should allow PENDING → CANCELLED', () => {
      expect(tracker.isValidTransition(TaskStatus.PENDING, TaskStatus.CANCELLED)).toBe(true);
    });

    it('should allow QUEUED → RUNNING', () => {
      expect(tracker.isValidTransition(TaskStatus.QUEUED, TaskStatus.RUNNING)).toBe(true);
    });

    it('should allow RUNNING → SUCCESS', () => {
      expect(tracker.isValidTransition(TaskStatus.RUNNING, TaskStatus.SUCCESS)).toBe(true);
    });

    it('should allow RUNNING → FAILED', () => {
      expect(tracker.isValidTransition(TaskStatus.RUNNING, TaskStatus.FAILED)).toBe(true);
    });

    it('should allow FAILED → PENDING (retry)', () => {
      expect(tracker.isValidTransition(TaskStatus.FAILED, TaskStatus.PENDING)).toBe(true);
    });

    it('should reject SUCCESS → RUNNING (terminal state)', () => {
      expect(tracker.isValidTransition(TaskStatus.SUCCESS, TaskStatus.RUNNING)).toBe(false);
    });

    it('should reject CANCELLED → PENDING (terminal state)', () => {
      expect(tracker.isValidTransition(TaskStatus.CANCELLED, TaskStatus.PENDING)).toBe(false);
    });

    it('should reject PENDING → SUCCESS (skip states)', () => {
      expect(tracker.isValidTransition(TaskStatus.PENDING, TaskStatus.SUCCESS)).toBe(false);
    });
  });

  describe('transition', () => {
    it('should record a valid transition', () => {
      const result = tracker.transition('task-1', TaskStatus.PENDING, TaskStatus.QUEUED);

      expect(result.from).toBe(TaskStatus.PENDING);
      expect(result.to).toBe(TaskStatus.QUEUED);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should record transition with reason', () => {
      const result = tracker.transition('task-1', TaskStatus.RUNNING, TaskStatus.FAILED, 'Model timeout');

      expect(result.reason).toBe('Model timeout');
    });

    it('should throw InvalidTransitionError for invalid transitions', () => {
      expect(() => {
        tracker.transition('task-1', TaskStatus.SUCCESS, TaskStatus.RUNNING);
      }).toThrow(InvalidTransitionError);
    });

    it('should throw with descriptive message', () => {
      expect(() => {
        tracker.transition('task-1', TaskStatus.PENDING, TaskStatus.SUCCESS);
      }).toThrow('Invalid status transition: pending → success');
    });
  });

  describe('getHistory', () => {
    it('should return empty array for unknown task', () => {
      expect(tracker.getHistory('unknown')).toEqual([]);
    });

    it('should return full transition history', () => {
      tracker.transition('task-1', TaskStatus.PENDING, TaskStatus.QUEUED);
      tracker.transition('task-1', TaskStatus.QUEUED, TaskStatus.RUNNING);
      tracker.transition('task-1', TaskStatus.RUNNING, TaskStatus.SUCCESS);

      const history = tracker.getHistory('task-1');
      expect(history).toHaveLength(3);
      expect(history[0].from).toBe(TaskStatus.PENDING);
      expect(history[2].to).toBe(TaskStatus.SUCCESS);
    });
  });

  describe('getValidNextStates', () => {
    it('should return valid next states for RUNNING', () => {
      const states = tracker.getValidNextStates(TaskStatus.RUNNING);
      expect(states).toContain(TaskStatus.SUCCESS);
      expect(states).toContain(TaskStatus.FAILED);
      expect(states).toContain(TaskStatus.BLOCKED);
      expect(states).toContain(TaskStatus.CANCELLED);
    });

    it('should return empty array for terminal states', () => {
      expect(tracker.getValidNextStates(TaskStatus.SUCCESS)).toEqual([]);
      expect(tracker.getValidNextStates(TaskStatus.CANCELLED)).toEqual([]);
    });
  });

  describe('isTerminal', () => {
    it('should identify SUCCESS as terminal', () => {
      expect(tracker.isTerminal(TaskStatus.SUCCESS)).toBe(true);
    });

    it('should identify CANCELLED as terminal', () => {
      expect(tracker.isTerminal(TaskStatus.CANCELLED)).toBe(true);
    });

    it('should identify RUNNING as non-terminal', () => {
      expect(tracker.isTerminal(TaskStatus.RUNNING)).toBe(false);
    });
  });

  describe('getDurationInStatus', () => {
    it('should return null for unknown task', () => {
      expect(tracker.getDurationInStatus('unknown', TaskStatus.RUNNING)).toBeNull();
    });

    it('should return null if task never entered the status', () => {
      tracker.transition('task-1', TaskStatus.PENDING, TaskStatus.QUEUED);
      expect(tracker.getDurationInStatus('task-1', TaskStatus.RUNNING)).toBeNull();
    });

    it('should calculate duration for completed status', () => {
      tracker.transition('task-1', TaskStatus.PENDING, TaskStatus.QUEUED);
      tracker.transition('task-1', TaskStatus.QUEUED, TaskStatus.RUNNING);

      // Simulate time passing
      const history = tracker.getHistory('task-1');
      history[1].timestamp = new Date(Date.now() - 5000); // entered RUNNING 5s ago

      tracker.transition('task-1', TaskStatus.RUNNING, TaskStatus.SUCCESS);

      const duration = tracker.getDurationInStatus('task-1', TaskStatus.RUNNING);
      expect(duration).not.toBeNull();
      expect(duration!).toBeGreaterThanOrEqual(0);
    });
  });

  describe('clearHistory', () => {
    it('should clear history for a task', () => {
      tracker.transition('task-1', TaskStatus.PENDING, TaskStatus.QUEUED);
      expect(tracker.getHistory('task-1')).toHaveLength(1);

      tracker.clearHistory('task-1');
      expect(tracker.getHistory('task-1')).toEqual([]);
    });
  });
});
