const os = require('os')
const stream = require('stream')
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


async function setup() {
  const app = express()
  app.set('trust proxy', true)
  
  // Store copy of response body
  app.use(storeResponseBody())

  app.use((req, res, next) => {
    const raw = new stream.PassThrough()
    raw.headers = {
      'content-length': req.get('content-length'),
      'content-type': req.get('content-type'),
    }
    const parsed = new stream.PassThrough()
    parsed.headers = {
      'content-length': req.get('content-length'),
      'content-type': req.get('content-type'),
    }

    req.pipe(new stream.Writable({
      write: (chunk, encoding, callback) => {
        console.log("ENCODING")
        console.log(encoding)
        raw.push(chunk, encoding)
        parsed.push(chunk, encoding)
        callback()
      },
      destroy: (err, callback) => {
        raw.destroy(err)
        parsed.destroy(err)
        callback()
      },
      final: (callback) => {
        raw.push(null)
        parsed.push(null)
        callback()
      }
    }))

    Promise.all([
      new Promise((resolve, reject) => {
        bodyParser.raw({ type: '*/*' })(raw, res, () => {
          resolve(raw)
        })

      }),
      new Promise((resolve, reject) => {
        const parsers = [
          bodyParser.json({}),
          bodyParser.urlencoded(),
          bodyParser.urlencoded({ extended: true }),

          formData.parse({
            uploadDir: os.tmpdir(),
            autoClean: true,
          }),
          formData.union(),
        ]

        // Create nested method in the same order as they are in "parsers" array
        // by passing next parser as the callback of previous parser. The last function
        // in the chain responsible for resolving the promise.
        const chained = parsers.reverse().reduce((acc, parser) => {
          return () => parser(parsed, res, acc)
        }, () => {
          resolve(parsed)
        })

        // Call out the nested method
        chained()
      })
    ]).then(([rawStream, parsedStream]) => {
      req.body = parsedStream.body
      req.rawBody = rawStream.body

      next()
    })

  })

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
