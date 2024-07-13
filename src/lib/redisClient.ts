import { createClient, type RedisClientType } from 'redis'

const redisClient: RedisClientType = createClient({
  password: Bun.env.REDIS_PASSWORD,
  socket: {
    host: Bun.env.REDIS_HOST,
    port: Number(Bun.env.REDIS_PORT),
  }
});

(async () => {
  try {
    await redisClient.connect()
    console.log('Redis connected successfully')
  } catch (err) {
    console.error('Failed to connect to Redis:', err)
  }
})()

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err)
})

export default redisClient
