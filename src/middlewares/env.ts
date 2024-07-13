import { env } from 'hono/adapter'
import { createMiddleware } from 'hono/factory'

export const envMiddleware = createMiddleware(async (c, next) => {
  const { SECRET_KEY } = env<{ SECRET_KEY: string }>(c, 'bun')
  const { BUN_ENV } = env<{ BUN_ENV: string }>(c, 'bun')

  const missingVars: string[] = []

  !SECRET_KEY && missingVars.push('SECRET_KEY')
  !BUN_ENV && missingVars.push('BUN_ENV')

  if (missingVars.length > 0) {
    console.error(`Missing environment variable(s): ${missingVars.join(', ')}`)
    return c.json({ message: 'Internal server error' }, 500)
  }

  await next()
})
