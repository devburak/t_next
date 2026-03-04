module.exports = {
  apps: [
    {
      name: 'tmmob-pr',
      cwd: '/home/frtmmob/next',
      script: 'npm',
      args: 'run start -- -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        API_BASE_URL: 'https://api.tmmob.org.tr/api',
        NEXT_PUBLIC_API_BASE_URL: 'https://api.tmmob.org.tr/api',
        NEXT_PUBLIC_SITE_URL: 'https://newt6491032g.tmmob.org.tr',
      },
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
  ],
};
