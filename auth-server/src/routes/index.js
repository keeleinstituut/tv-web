const { Router } = require('express')
const { constructAuthRoutes } = require('./auth')
const { constructContextRoutes } = require('./context')
const { constructProxyRoutes } = require('./proxy')

function constructRoutes() {
  const router = Router()

  router.use(constructAuthRoutes())
  router.use(constructContextRoutes())
  router.use(constructProxyRoutes())

  return router
}

module.exports = {
  constructRoutes,
}
