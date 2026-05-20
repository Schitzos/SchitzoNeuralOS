module.exports = {
  apps: [
    {
      name: 'schitzo-core-api',
      cwd: './apps/core',
      script: 'dist/main.js',
      env: { NODE_ENV: 'production', PORT: 3000 },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
    },
    {
      name: 'schitzo-worker',
      cwd: './apps/core',
      script: 'dist/worker.js',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      max_restarts: 10,
    },
    {
      name: 'neural-console',
      cwd: './apps/console',
      script: 'node_modules/.bin/next',
      args: 'start --port 3001',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
    },
  ],
};
