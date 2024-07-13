import { env } from 'hono/adapter'
import { getSession } from '../utils/session'
import { getSignedCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const { SECRET_KEY } = env<{ SECRET_KEY: string }>(c, 'bun')

  // to-do: A possibly safe approach to avoid overload on Redis would be 
  // carrying the session data in the JWT payload. This can solve future
  // scalability issues.

  try {
    const { sessionId } = await getSignedCookie(c, SECRET_KEY)

    if (!sessionId) return c.json({ message: 'Unauthorized' }, 401)

    const session = await getSession(sessionId)

    if (!session) return c.json({ message: 'Session expired, please sign in again' }, 401)

    c.set('session', session)

    await next()
  } catch (error) {
    console.error('Error handling session:', error)
    return c.json({ message: 'Internal server error' }, 500)
  }
})
