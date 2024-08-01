const { randomUUID } = require("crypto")
const { SESSION_COOKIE_NAME } = require("./env")

const getCsrfTokenFromSession = (req) => {
  return req[SESSION_COOKIE_NAME].csrfToken
}

const setCsrfTokenToSession = (req) => {
  if (!getCsrfTokenFromSession(req)) {
    req[SESSION_COOKIE_NAME].csrfToken = randomUUID().toString()
  }
}


module.exports = {
  getCsrfTokenFromSession,
  setCsrfTokenToSession,
}