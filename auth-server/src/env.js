require('dotenv').config()

const NODE_ENV = process.env.NODE_ENV || 'production'
const PORT = process.env.SERVER_PORT || 8000
const HOST = process.env.SERVER_HOST || 'localhost'

const ENV = {
  PORT,
  HOST,
  NODE_ENV,

  APP_SECRET: process.env.APP_SECRET,

  APP_URL: process.env.APP_URL || `http://${HOST}:${PORT}`,
  REDIS_URL: process.env.REDIS_URL,

  CLIENT_ID: process.env.OAUTH_CLIENT_ID,
  CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
  ISSUER: process.env.OAUTH_ISSUER,

  TRANSLATION_ORDER_SERVICE_BASE_URL:
    process.env.TRANSLATION_ORDER_SERVICE_BASE_URL,
  AUTHORIZATION_SERVICE_BASE_URL: process.env.AUTHORIZATION_SERVICE_BASE_URL,
  TRANSLATION_MEMORY_SERVICE_BASE_URL:
    process.env.TRANSLATION_MEMORY_SERVICE_BASE_URL,
  AUDIT_LOG_SERVICE_BASE_URL: process.env.AUDIT_LOG_SERVICE_BASE_URL,

  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(','),
  ALLOWED_REDIRECT_URIS: process.env.ALLOWED_REDIRECT_URIS?.split(','),
  DEFAULT_REDIRECT_URI: process.env.DEFAULT_REDIRECT_URI,

  SESSION_COOKIE_NAME: NODE_ENV === 'production' ? '__HOST-session' : 'session',

  AMQP_URL: process.env.AMQP_URL,
  AMQP_AUDITLOG_EXCHANGE: process.env.AMQP_AUDITLOG_EXCHANGE || 'audit-log-events',
}

module.exports = ENV
