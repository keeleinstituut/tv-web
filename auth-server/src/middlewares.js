const amqp = require('./amqp')
const { AuditLogMessage } = require('./util')

const storeOriginalRequestBody = () => (req, res, next) => {
  req.rawBody = ''

  req.on('data', (chunk) => {
    req.rawBody += chunk
  })

  next()
}

const storeResponseBody = () => (req, res, next) => {
  const oldWrite = res.write
  res.locals.chunks = []

  res.write = function (chunk) {
    res.locals.chunks.push(chunk)
    return oldWrite.apply(res, arguments)
  }

  next()
}

const sendToAuditLog = async () => {
  const auditLog = await amqp.auditLog()

  return (req, res, next) => {
    const auditLogMessage = new AuditLogMessage()
    auditLogMessage.collectFromReq(req)

    res.on("finish", () => {
      auditLogMessage.collectFromRes(res)

      if (auditLogMessage.shouldSend(req, res)) {
        auditLog.send(auditLogMessage.toJsonObject())
      }
    })

    next()
  }
}

module.exports = {
  storeOriginalRequestBody,
  storeResponseBody,
  sendToAuditLog,
}