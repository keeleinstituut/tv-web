const requiresValidAccessToken = () => (req, res, next) => {
  const { accessToken } = req.oidc

  if (!!accessToken && accessToken.isExpired()) {
    return res.status(401).json()
  }

  next()
}

module.exports = {
  requiresValidAccessToken,
}
