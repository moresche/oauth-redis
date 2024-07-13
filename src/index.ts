import { Hono } from 'hono'
import { auth } from './routes'
import { csrf } from 'hono/csrf'
import { logger } from 'hono/logger'
import { showRoutes } from 'hono/dev'
import redis from './lib/redisClient'
import { envMiddleware } from './middlewares'
import { trimTrailingSlash } from 'hono/trailing-slash'

const app = new Hono({ strict: true }).basePath('/api/v1')

app.use('*', envMiddleware, logger(), trimTrailingSlash(), csrf())

app.route('/auth', auth)

showRoutes(app, {
  verbose: false,
})

export default app

process.on('SIGINT', async () => {
  console.log('Closing Redis connection...')
  await redis.quit()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Closing Redis connection...')
  await redis.quit()
  process.exit(0)
})
