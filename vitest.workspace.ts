import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'apps/core',
  'apps/console',
  'packages/shared',
  'packages/types',
]);
