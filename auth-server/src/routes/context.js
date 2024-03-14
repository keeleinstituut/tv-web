const { Router } = require('express')
const { jwtDecode } = require('jwt-decode')
const { requiresAuth } = require('express-openid-connect')
const { ISSUER, CLIENT_ID, CLIENT_SECRET } = require('../env')

function constructContextRoutes() {
  const router = Router()

  router.get('/context', async (req, res) => {
    const { accessToken, refreshToken } = req.oidc
    const parsedAccessToken = !accessToken
      ? {}
      : jwtDecode(accessToken.access_token)

    if (!accessToken) {
      return res.status(200).json()
    }

    const { exp: sessionExpiry } = jwtDecode(refreshToken)

    res.json({
      sessionExpiry,
      authenticated: true,
      user: parsedAccessToken?.tolkevarav,
    })
  })

  router.get('/switch-context', requiresAuth(), async (req, res) => {
    const { institution_id } = req.query

    const response = await fetch(`${ISSUER}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'X-Selected-Institution-ID': institution_id,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: req.oidc.refreshToken,
      }),
    })
    if (response.status === 200) {
      await req.oidc.accessToken.refresh()
      return res.status(200).json()
    }

    res.status(422).json()
  })

  return router
}

module.exports = {
  constructContextRoutes,
}
