import { randomBytes } from 'crypto'
import redis from '../lib/redisClient'

type SessionData = {
  [x: string]: string
}

export const getSession = async (sessionId: string) => {
  const session = await redis.hGetAll(`session:${sessionId}`)
  
  const hasData = Object.keys(session).length > 0 ? true : false

  if (!hasData) return false

  for (const key in session) session[key] = JSON.parse(session[key])

  return session
}

export const createSession = async (data: SessionData, expiresIn: number) => {
  const buffer = randomBytes(16)

  const base64String = buffer.toString('base64')

  await redis.hSet(`session:${base64String}`, data)

  await redis.expire(`session:${base64String}`, expiresIn)

  return { sessionId: base64String }
}