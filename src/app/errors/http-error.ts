export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad request') {
    super(message, 400)
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(message, 403)
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(message, 404)
  }
}

export class MethodNotAllowedError extends HttpError {
  constructor(message = 'Method not allowed') {
    super(message, 405)
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(message, 409)
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = 'Unprocessable entity') {
    super(message, 422)
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = 'Too many requests') {
    super(message, 429)
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal server error') {
    super(message, 500)
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message = 'Service unavailable') {
    super(message, 503)
  }
}
