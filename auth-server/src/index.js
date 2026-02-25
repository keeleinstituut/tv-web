const os = require('os')
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const httpErrors = require('http-errors')
const bodyParser = require('body-parser')
const formData = require('express-form-data')
const { auth } = require('express-openid-connect')
const { createClient } = require('redis')
const { RedisStore } = require('connect-redis')
const streamify = require('stream-array')

const {
  autoRefreshAccessToken,
  populateCsrfTokenIntoSession,
  populateSessionMetadata,
  indexUserSession,
} = require('./routes/middleware')
const amqp = require('./amqp')
const { constructRoutes } = require('./routes/index')
const { sendToAuditLog, storeResponseBody } = require('./middlewares')

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
const { constructProxyDirectRoutes } = require('./routes/proxy-direct')


async function setup() {
  const app = express()
  app.set('trust proxy', true)
  
  // Store copy of response body
  app.use(storeResponseBody())

  // Parse request body as raw for passing it to proxy
  app.use(bodyParser.raw({type: '*/*', limit: '100mb'}))
  app.use((req, res, next) => {
    const rawBody = req.body
    req.rawBody = rawBody
    req.body = undefined
    next()
  })

  // Since request is already read then parser middlewares can't be
  // used normally. This middleware uses rawBody as the incoming stream
  app.use(async (req, res, next) => {
    const stream = streamify([req.rawBody])
    stream.headers = req.headers

    const parsers = [
      bodyParser.json({}),
      bodyParser.urlencoded({ extended: false }),
      bodyParser.urlencoded({ extended: true }),

      formData.parse({
        uploadDir: os.tmpdir(),
        autoClean: true,
      }),
      formData.union(),
    ]

    const promises = parsers.map((parserFunction) => {
      return () => new Promise((resolve, reject) => {
        parserFunction(stream, res, (err) => {
          if (err) {
            reject()
          } else {
            resolve()
          }
        })
      })
    })

    for (let index = 0; index < promises.length; index++) {
      const promise = promises[index];
      await promise()
    }

    // Assign parsed body to req object
    req.body = stream.body

    next()
  })

  // Logging
  app.use(morgan('combined'))

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

  app.locals.redisClient = redisClient
  app.locals.redisStore = redisStore
  app.locals.amqp = amqp

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


  const mainRouter = express.Router()

  mainRouter.use(populateSessionMetadata())
  mainRouter.use(populateCsrfTokenIntoSession())
  mainRouter.use(autoRefreshAccessToken())
  mainRouter.use(indexUserSession())
  mainRouter.use(await sendToAuditLog())

  mainRouter.use(constructRoutes())

  app.use(mainRouter)

  app.use('/direct', constructProxyDirectRoutes())

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

  app.listen(PORT, HOST, function (err) {
    if (err) {
      console.error('Server failed to start:', err)
      process.exit(1)
    }
    console.log(`Listening at http://${HOST}:${PORT}`)
  })
}

main()
