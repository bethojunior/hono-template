import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { inject, injectable } from 'tsyringe'
import { LoginUserDto } from '../dto/users/login.dto'
import { RefreshTokenDto } from '../dto/users/refresh-token.dto'
import { HttpError } from '../errors/http-error'
import type { JwtPayload } from '../providers/jwt/jwt.provider'
import { UserService } from '../services/user.service'

@injectable()
export class AuthController {
  constructor(
    @inject(UserService)
    private readonly service: UserService
  ) {}

  async login(c: Context) {
    try {
      const body = c.get('body') as LoginUserDto
      const result = await this.service.login(body.email, body.password)
      return c.json(result)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }

  async refreshToken(c: Context) {
    try {
      const body = c.get('body') as RefreshTokenDto
      const result = await this.service.refreshToken(body.refreshToken)
      return c.json(result)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }

  async logout(c: Context) {
    try {
      const user = c.get('user') as JwtPayload
      await this.service.logout(user.sub)
      return c.json({ message: 'Logged out successfully' })
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }
}
