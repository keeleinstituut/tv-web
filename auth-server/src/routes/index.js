const { Router } = require('express')
const { constructAuthRoutes } = require('./auth')
const { constructContextRoutes } = require('./context')
const { constructSessionRoutes } = require('./sessions')
const { constructProxyRoutes } = require('./proxy')
const { constructHealthRoutes } = require('./health')

function constructRoutes() {
  const router = Router()

  router.use(constructHealthRoutes())
  router.use(constructAuthRoutes())
  router.use(constructContextRoutes())
  router.use(constructSessionRoutes())
  router.use(constructProxyRoutes())

  return router
}

module.exports = {
  constructRoutes,
}
