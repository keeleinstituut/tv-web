const { getValidCsrfToken } = require("../util")

const requiresValidAccessToken = () => (req, res, next) => {
  const { accessToken } = req.oidc

  if (!!accessToken && accessToken.isExpired()) {
    return res.status(401).json()
  }

  next()
}

const requiresValidCsrfToken = () => (req, res, next) => {
  const submittedCsrfToken = req.headers['x-csrf-token']
  const validCsrfToken = getValidCsrfToken(req)

  if (submittedCsrfToken !== validCsrfToken) {
    return res.status(401).json()
  }

  next()
}

module.exports = {
  requiresValidAccessToken,
  requiresValidCsrfToken,
}
