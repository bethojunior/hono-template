import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { inject, injectable } from 'tsyringe'
import { CreateUserDto } from '../dto/users/create-user.dto'
import { LoginUserDto } from '../dto/users/login.dto'
import { HttpError } from '../errors/http-error'
import { UserService } from '../services/user.service'

@injectable()
export class UsersController {
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

  async findAll(c: Context) {
    try {
      const users = await this.service.findAll()
      return c.json(users)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }

  async store(c: Context) {
    try {
      const body = c.get('body') as CreateUserDto
      const user = await this.service.store(body)
      return c.json(user, 201)
    } catch (error) {
      if (error instanceof HttpError) {
        return c.json({ error: error.message }, error.statusCode as ContentfulStatusCode)
      }
      return c.json({ error: (error as Error).message }, 500)
    }
  }
}
