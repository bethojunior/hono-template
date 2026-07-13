import type { MiddlewareHandler } from 'hono'
import { container } from 'tsyringe'
import { JwtProvider } from '../providers/jwt/jwt.provider'

const jwtProvider = container.resolve(JwtProvider)

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Token not provided' }, 401)
  }

  const token = authHeader.slice('Bearer '.length)

  try {
    const payload = jwtProvider.verify(token)
    c.set('user', payload)
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  await next()
}
