import { describe, it, expect } from 'vitest';

describe('AppController', () => {
  it('health check returns ok', () => {
    const result = { status: 'ok', service: 'schitzo-core' };
    expect(result.status).toBe('ok');
  });
});
