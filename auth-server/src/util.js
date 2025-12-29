const { jwtDecode } = require('jwt-decode')
const { randomUUID } = require('crypto')
const { SESSION_COOKIE_NAME } = require('./env')

const getCsrfTokenFromSession = (req) => {
  return req[SESSION_COOKIE_NAME].csrfToken
}

const setCsrfTokenToSession = (req) => {
  if (!getCsrfTokenFromSession(req)) {
    req[SESSION_COOKIE_NAME].csrfToken = randomUUID().toString()
  }
}

const getSessionId = (req) => {
  let sessionId = req.sessionID

  if (!sessionId && req.cookies && req.cookies[SESSION_COOKIE_NAME]) {
    sessionId = req.cookies[SESSION_COOKIE_NAME]
  }

  if (!sessionId && req[SESSION_COOKIE_NAME]) {
    sessionId = req[SESSION_COOKIE_NAME].id || req[SESSION_COOKIE_NAME].sessionID
  }

  if (!sessionId && req.headers.cookie) {
    const cookieHeader = req.headers.cookie
    const cookieMatch = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`))
    if (cookieMatch) {
      sessionId = cookieMatch[1]
    }
  }

  return sessionId
}


class AuditLogMessage {
  constructor() {
    this.generalData = {}
    this.requestData = {}
    this.responseData = {}
  }
  
  collectFromReq(req) {
    const { accessToken } = req.oidc
    const parsedAccessToken = !accessToken
      ? {}
      : jwtDecode(accessToken.access_token)

    this.generalData.happened_at = new Date()
    this.generalData.actor_pic = parsedAccessToken.tolkevarav?.personalIdentificationCode
    this.generalData.actor_name = parsedAccessToken.tolkevarav?.forename + " " + parsedAccessToken.tolkevarav?.surname
    this.generalData.actor_session = parsedAccessToken.session_state
    this.generalData.actor_department_id = parsedAccessToken.tolkevarav?.department?.id
    this.generalData.actor_institution_id = parsedAccessToken.tolkevarav?.selectedInstitution?.id
    this.generalData.actor_institution_user_id = parsedAccessToken.tolkevarav?.institutionUserId
    this.generalData.web_path = req.headers['x-web-path'] || req.headers['referer']

    this.requestData.path = req.path
    this.requestData.method = req.method
    this.requestData.hostname = req.hostname
    this.requestData.headers = req.headers
    this.requestData.query = req.query
    this.requestData.body = req.body
  }

  collectFromRes(res) {
    this.generalData.action = res.getHeader('x-log-action')

    this.responseData.status_code = res.statusCode
    this.responseData.headers = res.getHeaders()
    // this.responseData.body = Buffer.concat(res.locals.chunks).toString('utf-8')
  }

  toJsonObject() {
    return {
      general: this.generalData,
      request: this.requestData,
      response: this.responseData,
    }
  }

  shouldSend(req, res) {
    const conditions = [
      !res.locals.skipAuditLog,
      res.statusCode != 500,
      !!res.getHeader('x-log-action'),
      !!this.generalData.actor_institution_id,
    ]

    return conditions.every(value => value === true)
  }
}

/**
 * Extracts user PIC and refresh token from session data.
 * Uses the current format: connect-redis stores session data in {header, data, cookie} structure
 * where oidc tokens are stored flat in data: {access_token, refresh_token, ...}
 * 
 * @param {string|object} rawSessionData - Raw session data (string or object)
 * @returns {{userPIC: string|null, refreshToken: string|null}} - Extracted user PIC and refresh token
 */
const extractSessionTokens = (rawSessionData) => {
  let userPIC = null
  let refreshToken = null

  const session = typeof rawSessionData === 'string' ? JSON.parse(rawSessionData) : rawSessionData

  if (session.data?.access_token) {
    try {
      const tokenData = jwtDecode(session.data.access_token)
      userPIC = tokenData.tolkevarav?.personalIdentificationCode
      refreshToken = session.data.refresh_token || null
    } catch (e) {}
  }

  return { userPIC, refreshToken }
}

/**
 * Extracts session state and user PIC from session data.
 * Uses the current format: connect-redis stores session data in {header, data, cookie} structure
 * where oidc tokens are stored flat in data: {access_token, refresh_token, ...}
 * 
 * @param {string|object} rawSessionData - Raw session data (string or object)
 * @returns {{sessionState: string|null, userPIC: string|null}} - Extracted session state and user PIC
 */
const extractSessionInfo = (rawSessionData) => {
  let sessionState = null
  let userPIC = null

  const session = typeof rawSessionData === 'string' ? JSON.parse(rawSessionData) : rawSessionData

  if (session.data?.access_token) {
    try {
      const tokenData = jwtDecode(session.data.access_token)
      sessionState = tokenData.session_state || tokenData.sid || null
      userPIC = tokenData.tolkevarav?.personalIdentificationCode
    } catch (e) {
    }
  }

  return { sessionState, userPIC }
}

module.exports = {
  getCsrfTokenFromSession,
  setCsrfTokenToSession,
  getSessionId,
  AuditLogMessage,
  extractSessionTokens,
  extractSessionInfo,
}