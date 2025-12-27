const { Router } = require('express')
const { jwtDecode } = require('jwt-decode')
const { requiresAuth } = require('express-openid-connect')
const { ISSUER, CLIENT_ID, CLIENT_SECRET } = require('../env')
const { requiresValidCsrfToken } = require('./middleware')

function constructSessionRoutes() {
  const router = Router()

  router.get(
    '/sessions',
    requiresAuth(),
    async (req, res) => {
      try {
        const { redisClient } = req.app.locals
        const { accessToken } = req.oidc

        if (!accessToken) {
          return res.status(401).json({ error: 'Not authenticated' })
        }

        const currentUserToken = jwtDecode(accessToken.access_token)
        const currentUserPIC = currentUserToken.tolkevarav?.personalIdentificationCode
        const currentSessionId = req.sessionID

        if (!currentUserPIC) {
          return res.status(400).json({ error: 'User identifier not found' })
        }

        const indexKey = `tv-web:user-sessions:${currentUserPIC}`
        const sessionIds = await redisClient.sMembers(indexKey)

        const sessions = []
        const expiredSessionIds = []

        if (sessionIds.length === 0) {
          const currentSessionKey = `tv-web:sess:${currentSessionId}`
          const currentSessionData = await redisClient.get(currentSessionKey)

          if (currentSessionData) {
            try {
              const session = JSON.parse(currentSessionData)
              let sessionState = null
              let lastAccess = null

              if (session.oidc?.accessToken) {
                try {
                  const tokenData = jwtDecode(session.oidc.accessToken.access_token)
                  sessionState = tokenData.session_state || tokenData.sid || null
                  if (tokenData.tolkevarav?.personalIdentificationCode === currentUserPIC) {
                    lastAccess = session.cookie?.expires
                      ? new Date(session.cookie.expires).toISOString()
                      : null

                    sessions.push({
                      sessionId: currentSessionId,
                      isCurrent: true,
                      sessionState,
                      lastAccess,
                      createdAt: null,
                      userAgent: session.userAgent || null,
                      ipAddress: session.ipAddress || null,
                    })
                  }
                } catch (e) {
                }
              }
            } catch (error) {
              console.error(`Error parsing current session:`, error)
            }
          }

          return res.json({ sessions })
        }

        for (const sessionId of sessionIds) {
          const sessionKey = `tv-web:sess:${sessionId}`
          const sessionData = await redisClient.get(sessionKey)

          if (sessionData) {
            try {
              const session = JSON.parse(sessionData)
              let sessionState = null
              let lastAccess = null

              if (session.oidc) {
                try {
                  if (session.oidc.accessToken) {
                    const tokenData = jwtDecode(session.oidc.accessToken.access_token)
                    sessionState = tokenData.session_state || tokenData.sid || null
                    const sessionUserPIC = tokenData.tolkevarav?.personalIdentificationCode
                    if (sessionUserPIC !== currentUserPIC) {
                      continue
                    }
                  }
                } catch (e) {
                }
              }

              lastAccess = session.cookie?.expires
                ? new Date(session.cookie.expires).toISOString()
                : null

              sessions.push({
                sessionId,
                isCurrent: sessionId === currentSessionId,
                sessionState,
                lastAccess,
                createdAt: null,
                userAgent: session.userAgent || null,
                ipAddress: session.ipAddress || null,
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
        const { redisClient } = req.app.locals
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

        const sessionKey = `tv-web:sess:${sessionId}`
        const sessionData = await redisClient.get(sessionKey)

        if (!sessionData) {
          return res.status(404).json({ error: 'Session not found' })
        }

        const session = JSON.parse(sessionData)
        let userPIC = null
        let refreshToken = null

        if (session.oidc) {
          try {
            if (session.oidc.accessToken) {
              const tokenData = jwtDecode(session.oidc.accessToken.access_token)
              userPIC = tokenData.tolkevarav?.personalIdentificationCode
            }
            refreshToken = session.oidc.refreshToken
          } catch (e) {
            // Continue
          }
        }

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

        await redisClient.del(sessionKey)

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

