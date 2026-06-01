module.exports = {
  apps: [
    {
      name: 'hll-match-result-bot',
      script: './index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      cron_restart: '30 4 * * *',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
