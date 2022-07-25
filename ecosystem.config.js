module.exports = {
  apps : [{
    name   : "rating-checker-2",
    script : "./dist/main.js",
    instances: 1,
    watch: false,
    autorestart: true,
    max_memory_restart: "250M",
    cron_restart: "10 0 * * *",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
}
