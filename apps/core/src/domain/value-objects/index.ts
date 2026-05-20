export class TaskId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TaskId cannot be empty');
    }
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: TaskId): boolean {
    return this.value === other.value;
  }
}

export class AgentName {
  private readonly value: string;

  constructor(value: string) {
    if (!value || !/^[A-Z]{2,4}$/.test(value)) {
      throw new Error('AgentName must be 2-4 uppercase letters');
    }
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: AgentName): boolean {
    return this.value === other.value;
  }
}

export class UserPrompt {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('UserPrompt cannot be empty');
    }
    if (value.length > 10000) {
      throw new Error('UserPrompt cannot exceed 10000 characters');
    }
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  truncate(maxLength: number): string {
    if (this.value.length <= maxLength) {
      return this.value;
    }
    return this.value.substring(0, maxLength - 3) + '...';
  }
}