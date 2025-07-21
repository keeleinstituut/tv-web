const os = require('os')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const httpErrors = require('http-errors')
const bodyParser = require('body-parser')
const formData = require('express-form-data')
const { auth } = require('express-openid-connect')
const { createClient } = require('redis')
const RedisStore = require('connect-redis').default
const {
  autoRefreshAccessToken,
  populateCsrfTokenIntoSession,
} = require('./routes/middleware')
const amqp = require('./amqp')
const { constructRoutes } = require('./routes/index')
const { storeOriginalRequestBody, sendToAuditLog, storeResponseBody } = require('./middlewares')

const {
  HOST,
  PORT,
  APP_URL,
  APP_SECRET,
  CLIENT_ID,
  CLIENT_SECRET,
  ISSUER,
  ALLOWED_ORIGINS,
  REDIS_URL,
  SESSION_COOKIE_NAME,
} = require('./env')


async function setup() {
  const app = express()
  app.set('trust proxy', true)

  // Store copy of raw request body
  app.use(storeOriginalRequestBody())
  
  // Store copy of response body
  app.use(storeResponseBody())

  // Parsing
  app.use(bodyParser.json({}))
  app.use(bodyParser.urlencoded())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(formData.parse({
    uploadDir: os.tmpdir(),
    autoClean: true,
  }))
  app.use(formData.union())

  // Logging
  app.use(morgan())

  // Cors
  app.use((req, res, next) => {
    if (ALLOWED_ORIGINS.indexOf(req.header('Origin')) !== -1) {
      cors({
        origin: ALLOWED_ORIGINS,
        credentials: true,
      })(req, res, next)
    } else {
      next()
    }
  })

  await amqp.connect()

  const redisClient = createClient({
    url: REDIS_URL,
  })
  redisClient.connect()
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'tv-web:',
  })

  redisClient.on('error', function (error) {
    console.error(error)
  })

  app.use(
    auth({
      authRequired: false,
      errorOnRequiredAuth: true, // on missing auth return 401 instead of redirecting to login flow
      baseURL: APP_URL,
      secret: APP_SECRET,

      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      issuerBaseURL: ISSUER,

      authorizationParams: {
        response_type: 'code',
        scope: 'openid',
      },
      routes: {
        login: false,
        logout: false,
      },
      idpLogout: true, // trigger logout in central SSO as well when logging out
      session: {
        store: redisStore,
        name: SESSION_COOKIE_NAME,
      },
    })
  )

  app.use(populateCsrfTokenIntoSession())
  app.use(autoRefreshAccessToken())
  app.use(await sendToAuditLog())

  const routes = constructRoutes()
  app.use(routes)

  // Global error handler
  app.use((err, req, res, next) => {
    console.log(err)
    if (!httpErrors.isHttpError(err)) {
      console.error(err.stack)
      res.status(500).send('Something broke!')
    }
    next(err, req, res)
  })

  return app
}

// Entrypoint
async function main() {
  const app = await setup()

  app.listen(PORT, HOST, function () {
    console.log(`Listening at http://${HOST}:${PORT}`)
  })
}

main()
