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
    this.generalData.web_path = req.headers['x-web-path']

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
    this.responseData.body = Buffer.concat(res.locals.chunks).toString('utf-8')
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

module.exports = {
  getCsrfTokenFromSession,
  setCsrfTokenToSession,
  AuditLogMessage,
}