module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'core', 'console', 'shared', 'types', 'prisma',
      'telegram', 'workflow', 'agent', 'tools', 'auth',
      'ci', 'docs', 'config', 'deps'
    ]],
    'scope-empty': [1, 'never'],
  },
};
