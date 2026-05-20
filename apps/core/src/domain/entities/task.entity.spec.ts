import { describe, it, expect, beforeEach } from 'vitest';
import { Task } from './task.entity';
import { TaskId, UserPrompt } from '../value-objects';
import { TaskStatus, TaskType, ExecutionMode } from '../enums';

describe('Task Entity', () => {
  let task: Task;
  const taskId = new TaskId('task-123');
  const userPrompt = new UserPrompt('Implement user authentication');
  const projectId = 'project-456';
  const createdAt = new Date('2026-05-20T07:00:00.000Z');

  beforeEach(() => {
    task = new Task(
      taskId,
      userPrompt,
      projectId,
      TaskStatus.PENDING,
      TaskType.FEATURE,
      ExecutionMode.SINGLE,
      createdAt,
    );
  });

  describe('Status Transitions', () => {
    it('should allow valid status transitions from PENDING', () => {
      expect(task.canTransitionTo(TaskStatus.QUEUED)).toBe(true);
      expect(task.canTransitionTo(TaskStatus.CANCELLED)).toBe(true);
      expect(task.canTransitionTo(TaskStatus.RUNNING)).toBe(false);
    });

    it('should allow valid status transitions from RUNNING', () => {
      task.updateStatus(TaskStatus.QUEUED);
      task.updateStatus(TaskStatus.RUNNING);

      expect(task.canTransitionTo(TaskStatus.SUCCESS)).toBe(true);
      expect(task.canTransitionTo(TaskStatus.FAILED)).toBe(true);
      expect(task.canTransitionTo(TaskStatus.BLOCKED)).toBe(true);
      expect(task.canTransitionTo(TaskStatus.WAITING_APPROVAL)).toBe(true);
      expect(task.canTransitionTo(TaskStatus.CANCELLED)).toBe(true);
      expect(task.canTransitionTo(TaskStatus.PENDING)).toBe(false);
    });

    it('should update status successfully for valid transitions', () => {
      task.updateStatus(TaskStatus.QUEUED);
      expect(task.status).toBe(TaskStatus.QUEUED);

      task.updateStatus(TaskStatus.RUNNING);
      expect(task.status).toBe(TaskStatus.RUNNING);
    });

    it('should throw error for invalid status transitions', () => {
      expect(() => task.updateStatus(TaskStatus.RUNNING)).toThrow(
        'Invalid status transition from pending to running'
      );
    });

    it('should set completedAt when task reaches terminal state', () => {
      task.updateStatus(TaskStatus.QUEUED);
      task.updateStatus(TaskStatus.RUNNING);
      
      expect(task.completedAt).toBeUndefined();
      
      task.updateStatus(TaskStatus.SUCCESS);
      expect(task.completedAt).toBeInstanceOf(Date);
      expect(task.isCompleted()).toBe(true);
    });
  });

  describe('Status Checks', () => {
    it('should correctly identify completed tasks', () => {
      expect(task.isCompleted()).toBe(false);

      task.updateStatus(TaskStatus.QUEUED);
      task.updateStatus(TaskStatus.RUNNING);
      task.updateStatus(TaskStatus.SUCCESS);

      expect(task.isCompleted()).toBe(true);
    });

    it('should correctly identify running tasks', () => {
      expect(task.isRunning()).toBe(false);

      task.updateStatus(TaskStatus.QUEUED);
      task.updateStatus(TaskStatus.RUNNING);

      expect(task.isRunning()).toBe(true);
    });

    it('should correctly identify tasks requiring approval', () => {
      expect(task.requiresApproval()).toBe(false);

      task.updateStatus(TaskStatus.QUEUED);
      task.updateStatus(TaskStatus.RUNNING);
      task.updateStatus(TaskStatus.WAITING_APPROVAL);

      expect(task.requiresApproval()).toBe(true);
    });
  });

  describe('Duration Calculation', () => {
    it('should return null for incomplete tasks', () => {
      expect(task.getDuration()).toBeNull();
    });

    it('should calculate duration for completed tasks', () => {
      task.updateStatus(TaskStatus.QUEUED);
      task.updateStatus(TaskStatus.RUNNING);
      
      const completedAt = new Date('2026-05-20T07:30:00.000Z');
      task.completedAt = completedAt;
      
      const expectedDuration = completedAt.getTime() - createdAt.getTime();
      expect(task.getDuration()).toBe(expectedDuration);
    });
  });
});