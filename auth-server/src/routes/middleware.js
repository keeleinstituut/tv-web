const { jwtDecode } = require('jwt-decode')
const { getCsrfTokenFromSession, setCsrfTokenToSession, getSessionId } = require('../util')

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

const populateSessionMetadata = () => (req, res, next) => {
  // Only set userAgent and ipAddress if they're not already set (preserve original values)
  if (req[SESSION_COOKIE_NAME] && !req[SESSION_COOKIE_NAME].userAgent) {
    req[SESSION_COOKIE_NAME].userAgent = req.get('user-agent') || null
  }

  if (req[SESSION_COOKIE_NAME] && !req[SESSION_COOKIE_NAME].ipAddress) {
    // req.ip is available when trust proxy is enabled
    req[SESSION_COOKIE_NAME].ipAddress = req.ip || req.connection.remoteAddress || null
  }

  next()
}

const indexUserSession = () => async (req, res, next) => {
  try {
    const { accessToken } = req.oidc
    const { redisClient } = req.app.locals

    if (accessToken && !accessToken.isExpired()) {
      const parsedToken = jwtDecode(accessToken.access_token)
      const userPIC = parsedToken.tolkevarav?.personalIdentificationCode
      const sessionId = getSessionId(req)

      if (userPIC && sessionId) {
        const indexKey = `tv-web:user-sessions:${userPIC}`
        await redisClient.sAdd(indexKey, sessionId)
      }
    }
  } catch (error) {
    // Log error but don't block request
    console.error('Error indexing user session:', error)
  }

  next()
}

module.exports = {
  requiresValidAccessToken,
  requiresValidCsrfToken,
  autoRefreshAccessToken,
  populateCsrfTokenIntoSession,
  populateSessionMetadata,
  indexUserSession,
}
