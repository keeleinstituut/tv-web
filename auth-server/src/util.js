const { jwtDecode } = require("jwt-decode")

const getValidCsrfToken = (req) => {
  const { accessToken } = req.oidc
  if (!accessToken) {
    return null
  }

  return jwtDecode(accessToken.access_token)?.sid
}

module.exports = {
  getValidCsrfToken,
}