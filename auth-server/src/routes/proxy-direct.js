const { Router } = require('express')
const { createProxyMiddleware: proxy } = require('http-proxy-middleware')
const {
  TRANSLATION_ORDER_SERVICE_BASE_URL,
  AUTHORIZATION_SERVICE_BASE_URL,
  TRANSLATION_MEMORY_SERVICE_BASE_URL,
  AUDIT_LOG_SERVICE_BASE_URL,
} = require('../env')
const { omit } = require('lodash')

const attachAuthorizationHeader = (proxyReq, req, res) => {
  proxyReq.removeHeader('Cookie')
}

const removeCorsHeaders = (proxyRes, req, res) => {
  proxyRes.headers = omit(proxyRes.headers, [
    'access-control-max-age',
    'access-control-expose-headers',
    'access-control-allow-origin',
    'access-control-allow-methods',
    'access-control-allow-headers',
    'access-control-allow-credentials',
    'set-cookie',
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

function constructProxyDirectRoutes() {
  const router = Router()

  router.use(
    '/translation-order',
    proxy({
      target: TRANSLATION_ORDER_SERVICE_BASE_URL,
      changeOrigin: true,
      pathRewrite: {
        '/translation-order': '',
      },
      on: {
        proxyReq: onProxyReq,
        proxyRes: onProxyRes,
      },
    })
  )

  router.use(
    '/authorization',
    proxy({
      target: AUTHORIZATION_SERVICE_BASE_URL,
      changeOrigin: true,
      on: {
        proxyReq: onProxyReq,
        proxyRes: onProxyRes,
      },
    })
  )

  router.use(
    '/translation-memory',
    proxy({
      target: TRANSLATION_MEMORY_SERVICE_BASE_URL,
      changeOrigin: true,
      on: {
        proxyReq: onProxyReq,
        proxyRes: onProxyRes,
      },
    })
  )

  router.use(
    '/audit-log',
    proxy({
      target: AUDIT_LOG_SERVICE_BASE_URL,
      changeOrigin: true,
      on: {
        proxyReq: onProxyReq,
        proxyRes: onProxyRes,
      },
    })
  )

  return router
}

module.exports = {
  constructProxyDirectRoutes,
}
