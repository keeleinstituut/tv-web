const express = require('express')
const { auth } = require('express-openid-connect')
const { constructRoutes } = require('./routes/index')
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
const morgan = require('morgan')
const cors = require('cors')
const httpErrors = require('http-errors')
const { createClient } = require('redis')
const {
  autoRefreshAccessToken,
  populateCsrfTokenIntoSession,
} = require('./routes/middleware')
const RedisStore = require('connect-redis').default

async function setup() {
  const app = express()
  app.set('trust proxy', true)
  app.use(morgan())
  app.use(
    cors({
      origin: ALLOWED_ORIGINS,
      credentials: true,
    })
  )

  const redisClient = createClient({
    url: REDIS_URL,
  })
  redisClient.connect()
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'tv-web:',
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

  const routes = constructRoutes()
  app.use(routes)

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

async function main() {
  const app = await setup()

  app.listen(PORT, HOST, function () {
    console.log(`Listening at http://${HOST}:${PORT}`)
  })
}

main()
