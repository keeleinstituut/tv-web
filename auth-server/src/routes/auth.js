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
    res.locals.skipAuditLog = true
    res.oidc.login({
      returnTo: determineReturnToUrl(req.query),
    })
  })

  router.get('/logout', (req, res) => {
    res.locals.skipAuditLog = true

    const returnTo = determineReturnToUrl(req.query)

    // If the server-side session is already gone (e.g. another tab already
    // logged out, or the session expired), express-openid-connect would still
    // perform logout to Keycloak WITHOUT id_token_hint, which
    // Keycloak rejects with "Missing parameters: id_token_hint". There is
    // nothing left to log out of, so just return to the app.
    if (!req.oidc.isAuthenticated()) {
      return res.redirect(returnTo)
    }

    res.oidc.logout({ returnTo })
  })

  return router
}

module.exports = {
  constructAuthRoutes,
}
