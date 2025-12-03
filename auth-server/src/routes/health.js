const { Router } = require('express')

function constructHealthRoutes() {
  const router = Router()

  router.get('/healthz', (req, res) => {
    res.locals.skipAuditLog = true
    res.status(200).json({ status: 'ok' })
  })

  router.get('/healthz/ready', async (req, res) => {
    res.locals.skipAuditLog = true
    
    try {
      const { redisClient, amqp } = req.app.locals
      const amqpHealthy = amqp ? amqp.checkHealth() : false
      const redisHealthy = await checkRedisHealth(redisClient)

      if (amqpHealthy && redisHealthy) {
        res.status(200).json({ status: 'ready' })
      } else {
        res.status(503).json({ 
          status: 'not ready',
          amqp: amqpHealthy,
          redis: redisHealthy
        })
      }
    } catch (error) {
      console.error('Health check error:', error)
      res.status(503).json({ status: 'not ready', error: error.message })
    }
  })

  return router
}

async function checkRedisHealth(redisClient) {
  try {
    if (!redisClient) {
      return false
    }

    const result = await redisClient.ping()
    return result === 'PONG'
  } catch (error) {
    console.error('Redis health check error:', error)
    return false
  }
}

module.exports = {
  constructHealthRoutes,
}

