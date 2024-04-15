const { Router } = require('express')
const { ALLOWED_REDIRECT_URIS, DEFAULT_REDIRECT_URI } = require('../env')

const determineReturnToUrl = (query) => {
  let { redirect_uri: returnTo } = query

  if (!ALLOWED_REDIRECT_URIS.includes(returnTo)) {
    returnTo = DEFAULT_REDIRECT_URI
  }
  return returnTo
}

function constructAuthRoutes() {
  const router = Router()

  router.get('/login', (req, res) => {
    res.oidc.login({
      returnTo: determineReturnToUrl(req.query),
    })
  })

  router.get('/logout', (req, res) => {
    res.oidc.logout({
      returnTo: determineReturnToUrl(req.query),
    })
  })

  return router
}

module.exports = {
  constructAuthRoutes,
}
