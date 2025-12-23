const { jwtDecode } = require('jwt-decode')
const { getCsrfTokenFromSession, setCsrfTokenToSession } = require('../util')

const requiresValidAccessToken = () => (req, res, next) => {
  const { accessToken } = req.oidc

  if (!!accessToken && accessToken.isExpired()) {
    return res.status(401).json()
  }

  next()
}

const requiresValidCsrfToken = () => (req, res, next) => {
  const submittedCsrfToken = req.headers['x-csrf-token']
  const validCsrfToken = getCsrfTokenFromSession(req)

  if (req.method !== 'GET' && (!submittedCsrfToken || submittedCsrfToken !== validCsrfToken)) {
    return res.status(401).json()
  }

  next()
}

const populateCsrfTokenIntoSession = () => (req, res, next) => {
  const { accessToken } = req.oidc
  if (!!accessToken && !accessToken.isExpired()) {
    setCsrfTokenToSession(req)
  }

  next()
}

const autoRefreshAccessToken = () => async (req, res, next) => {
  const { accessToken } = req.oidc

  if (!!accessToken && accessToken.isExpired()) {
    const { exp } = jwtDecode(req.oidc.refreshToken)
    const now = Math.ceil(Date.now() / 1000)
    if (now < exp) {
      try {
        await accessToken.refresh()
      } catch (err) { }
    }
  }

  next()
}

module.exports = {
  requiresValidAccessToken,
  requiresValidCsrfToken,
  autoRefreshAccessToken,
  populateCsrfTokenIntoSession,
}
