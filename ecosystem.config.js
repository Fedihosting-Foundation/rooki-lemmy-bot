module.exports = {
  apps : [{
    name: "Mod",
    script: 'build/main.js',
    autorestart: true,
    watch: false,
    cron_restart: "0 0 * * *",
    exp_backoff_restart_delay: 1000
  }]
};
