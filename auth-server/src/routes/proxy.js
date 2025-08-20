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
const {
  requiresValidAccessToken,
  requiresValidCsrfToken,
} = require('./middleware')

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
  if (!proxyRes.headers['content-disposition']) {
    proxyRes.headers['content-disposition'] = 'attachment'
  }
}

const rewriteProxyReqBody = (proxyReq, req, res, options) => {
  if (!!req.rawBody) {
    proxyReq.setHeader('Content-Length', Buffer.byteLength(req.rawBody));
    proxyReq.write(req.rawBody)
  }
}

const onProxyReq = (proxyReq, req, res, options) => {
  attachAuthorizationHeader(proxyReq, req, res)
  rewriteProxyReqBody(proxyReq, req, res, options)
}

const onProxyRes = (proxyRes, req, res) => {
  removeCorsHeaders(proxyRes, req, res)
}

function constructProxyRoutes() {
  const router = Router()

  router.use(
    '/translation-order',
    requiresAuth(),
    requiresValidAccessToken(),
    requiresValidCsrfToken(),
    proxy({
      target: TRANSLATION_ORDER_SERVICE_BASE_URL,
      changeOrigin: true,
      pathRewrite: {
        '/translation-order': '',
      },
      onProxyReq,
      onProxyRes,
    })
  )

  router.use(
    '/authorization',
    requiresAuth(),
    requiresValidAccessToken(),
    requiresValidCsrfToken(),
    proxy({
      target: AUTHORIZATION_SERVICE_BASE_URL,
      changeOrigin: true,
      pathRewrite: {
        '/authorization': '',
      },
      onProxyReq,
      onProxyRes,
    })
  )

  router.use(
    '/translation-memory',
    requiresAuth(),
    requiresValidAccessToken(),
    requiresValidCsrfToken(),
    proxy({
      target: TRANSLATION_MEMORY_SERVICE_BASE_URL,
      changeOrigin: true,
      pathRewrite: {
        '/translation-memory': '',
      },
      onProxyReq,
      onProxyRes,
    })
  )

  router.use(
    '/audit-log',
    requiresAuth(),
    requiresValidAccessToken(),
    requiresValidCsrfToken(),
    proxy({
      target: AUDIT_LOG_SERVICE_BASE_URL,
      changeOrigin: true,
      pathRewrite: {
        '/audit-log': '',
      },
      onProxyReq,
      onProxyRes,
    })
  )

  return router
}

module.exports = {
  constructProxyRoutes,
}
