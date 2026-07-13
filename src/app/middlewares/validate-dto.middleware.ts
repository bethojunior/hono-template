import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import type { MiddlewareHandler } from 'hono'

export function validateDto<T extends object>(dtoClass: new () => T): MiddlewareHandler {
  return async (c, next) => {
    const body = await c.req.json()

    const dto = plainToInstance(dtoClass, body)

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    })

    if (errors.length > 0) {
      const formatted = Object.fromEntries(
        errors.map((error) => [error.property, Object.values(error.constraints ?? {})[0]])
      )

      return c.json(
        {
          message: 'Validation failed',
          errors: formatted,
        },
        400
      )
    }

    c.set('body', dto)

    await next()
  }
}
