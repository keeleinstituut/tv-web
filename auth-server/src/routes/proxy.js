const { Router } = require('express')
const { createProxyMiddleware: proxy } = require('http-proxy-middleware')
const { requiresAuth } = require('express-openid-connect')
const {
  TRANSLATION_ORDER_SERVICE_BASE_URL,
  AUTHORIZATION_SERVICE_BASE_URL,
  TRANSLATION_MEMORY_SERVICE_BASE_URL,
  AUDIT_LOG_SERVICE_BASE_URL,
} = require('../env')
const { omit } = require('lodash')
const { requiresValidAccessToken } = require('./middleware')

const attachAuthorizationHeader = (proxyReq, req, res) => {
  proxyReq.removeHeader('Cookie')
  proxyReq.setHeader(
    'Authorization',
    `Bearer ${req.oidc.accessToken.access_token}`
  )
}

const removeCorsHeaders = (proxyRes, req, res) => {
  proxyRes.headers = omit(proxyRes.headers, [
    'access-control-max-age',
    'access-control-expose-headers',
    'access-control-allow-origin',
    'access-control-allow-methods',
    'access-control-allow-headers',
    'access-control-allow-credentials',
  ])
}

function constructProxyRoutes() {
  const router = Router()

  router.use(
    '/translation-order',
    requiresAuth(),
    requiresValidAccessToken(),
    proxy({
      target: TRANSLATION_ORDER_SERVICE_BASE_URL,
      changeOrigin: true,
      pathRewrite: {
        '/translation-order': '',
      },
      onProxyReq: attachAuthorizationHeader,
      onProxyRes: removeCorsHeaders,
    })
  )

  router.use(
    '/authorization',
    requiresAuth(),
    requiresValidAccessToken(),
    proxy({
      target: AUTHORIZATION_SERVICE_BASE_URL,
      changeOrigin: true,
      pathRewrite: {
        '/authorization': '',
      },
      onProxyReq: attachAuthorizationHeader,
      onProxyRes: removeCorsHeaders,
    })
  )

  router.use(
    '/translation-memory',
    requiresAuth(),
    requiresValidAccessToken(),
    proxy({
      target: TRANSLATION_MEMORY_SERVICE_BASE_URL,
      changeOrigin: true,
      pathRewrite: {
        '/translation-memory': '',
      },
      onProxyReq: attachAuthorizationHeader,
      onProxyRes: removeCorsHeaders,
    })
  )

  router.use(
    '/audit-log',
    requiresAuth(),
    requiresValidAccessToken(),
    proxy({
      target: AUDIT_LOG_SERVICE_BASE_URL,
      changeOrigin: true,
      pathRewrite: {
        '/audit-log': '',
      },
      onProxyReq: attachAuthorizationHeader,
      onProxyRes: removeCorsHeaders,
    })
  )

  return router
}

module.exports = {
  constructProxyRoutes,
}
