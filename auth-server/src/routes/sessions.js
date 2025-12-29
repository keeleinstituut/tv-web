const { Router } = require('express')
const { jwtDecode } = require('jwt-decode')
const { requiresAuth } = require('express-openid-connect')
const { ISSUER, CLIENT_ID, CLIENT_SECRET } = require('../env')
const { requiresValidCsrfToken } = require('./middleware')
const { getSessionId, extractSessionTokens, extractSessionInfo } = require('../util')

function constructSessionRoutes() {
  const router = Router()

  router.get(
    '/sessions',
    requiresAuth(),
    async (req, res) => {
      try {
        const { redisClient, redisStore } = req.app.locals
        const { accessToken } = req.oidc

        if (!accessToken) {
          return res.status(401).json({ error: 'Not authenticated' })
        }

        const currentUserToken = jwtDecode(accessToken.access_token)
        const currentUserPIC = currentUserToken.tolkevarav?.personalIdentificationCode
        const currentSessionId = getSessionId(req)

        if (!currentUserPIC) {
          return res.status(400).json({ error: 'User identifier not found' })
        }

        const indexKey = `tv-web:user-sessions:${currentUserPIC}`
        const sessionIds = await redisClient.sMembers(indexKey)

        const sessions = []
        const expiredSessionIds = []
        for (const sessionId of sessionIds) {
          let sessionData = await new Promise((resolve, reject) => {
            redisStore.get(sessionId, (err, data) => {
              if (err) reject(err)
              else resolve(data)
            })
          })


          if (sessionData) {
            try {
              const session = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData
              const { sessionState, userPIC: sessionUserPIC } = extractSessionInfo(sessionData)

              if (sessionUserPIC !== currentUserPIC) {
                continue
              }

              const lastAccess = session.cookie?.expires
                ? new Date(session.cookie.expires).toISOString()
                : null

              // connect-redis stores custom session properties in session.data
              // OIDC tokens are also in session.data, but userAgent/ipAddress are custom properties
              const userAgent = session.data?.userAgent || session.userAgent || null
              const ipAddress = session.data?.ipAddress || session.ipAddress || null

              sessions.push({
                sessionId,
                isCurrent: sessionId === currentSessionId,
                sessionState,
                lastAccess,
                createdAt: null,
                userAgent,
                ipAddress,
              })
            } catch (error) {
              console.error(`Error parsing session ${sessionId}:`, error)
              expiredSessionIds.push(sessionId)
            }
          } else {
            expiredSessionIds.push(sessionId)
          }
        }

        if (expiredSessionIds.length > 0) {
          await redisClient.sRem(indexKey, ...expiredSessionIds)
        }

        res.json({ sessions })
      } catch (error) {
        console.error('Error fetching sessions:', error)
        res.status(500).json({ error: 'Failed to fetch sessions' })
      }
    }
  )

  router.delete(
    '/sessions/:sessionId',
    requiresAuth(),
    requiresValidCsrfToken(),
    async (req, res) => {
      try {
        const { redisClient, redisStore } = req.app.locals
        const { sessionId } = req.params
        const { accessToken } = req.oidc

        if (!accessToken) {
          return res.status(401).json({ error: 'Not authenticated' })
        }

        const currentUserToken = jwtDecode(accessToken.access_token)
        const currentUserPIC = currentUserToken.tolkevarav?.personalIdentificationCode

        if (!currentUserPIC) {
          return res.status(400).json({ error: 'User identifier not found' })
        }

        let sessionData = await new Promise((resolve, reject) => {
            redisStore.get(sessionId, (err, data) => {
              if (err) reject(err)
              else resolve(data)
            })
          })

        if (!sessionData) {
          return res.status(404).json({ error: 'Session not found' })
        }

        const { userPIC, refreshToken } = extractSessionTokens(sessionData)

        if (userPIC !== currentUserPIC) {
          return res.status(403).json({ error: 'Not authorized to invalidate this session' })
        }

        if (refreshToken) {
          try {
            const revokeResponse = await fetch(`${ISSUER}/protocol/openid-connect/revoke`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                token: refreshToken,
                token_type_hint: 'refresh_token',
              }),
            })

            if (revokeResponse.status !== 200 && revokeResponse.status !== 400) {
              console.warn(`Keycloak revocation returned status ${revokeResponse.status} for session ${sessionId}`)
            }
          } catch (error) {
            console.error(`Error invalidating Keycloak session for ${sessionId}:`, error)
          }
        }

        await new Promise((resolve, reject) => {
          redisStore.destroy(sessionId, (err) => {
            if (err) reject(err)
            else resolve()
          })
        })

        const indexKey = `tv-web:user-sessions:${currentUserPIC}`
        await redisClient.sRem(indexKey, sessionId)

        res.setHeader('X-Log-Action', 'auth-server.invalidate-session')
        res.status(200).json({ success: true })
      } catch (error) {
        console.error('Error invalidating session:', error)
        res.status(500).json({ error: 'Failed to invalidate session' })
      }
    }
  )

  return router
}

module.exports = {
  constructSessionRoutes,
}

