import { env } from 'hono/adapter'
import { Hono, type Context } from 'hono'
import { setSignedCookie } from 'hono/cookie'
import { createSession } from '../utils/session'
import { sessionMiddleware } from '../middlewares'
import { googleAuth } from '@hono/oauth-providers/google'

const app = new Hono()

app.get('/hello', sessionMiddleware, async (c: Context) => {
  const session = c.get('session')

  return c.json({ message: `Hello ${session.name}!` })
})

app.get(
  '/google/callback',
  googleAuth({
    client_id: Bun.env.GOOGLE_ID,
    client_secret: Bun.env.GOOGLE_SECRET,
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account'
  }),
  async c => {
    const token = c.get('token')
    const user = c.get('user-google')

    if (!token || !user) return c.redirect('/hello')

    const { sessionId } = await createSession({
      name: JSON.stringify(user.name),
      picture: JSON.stringify(user.picture)
    }, token.expires_in)

    const { SECRET_KEY } = env<{ SECRET_KEY: string }>(c, 'bun')
    const { BUN_ENV } = env<{ BUN_ENV: string }>(c, 'bun')

    await setSignedCookie(c, 'sessionId', sessionId, SECRET_KEY, 
      { 
        httpOnly: true, 
        sameSite: 'lax', 
        secure: BUN_ENV !== 'development', 
        maxAge:  token.expires_in, 
        path: '/' 
      }
    )
    
    return c.json({ token, user })
  }
)

export default app
