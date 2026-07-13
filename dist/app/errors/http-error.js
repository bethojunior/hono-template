"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableError = exports.InternalServerError = exports.TooManyRequestsError = exports.UnprocessableEntityError = exports.ConflictError = exports.MethodNotAllowedError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.HttpError = void 0;
class HttpError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}
exports.HttpError = HttpError;
class BadRequestError extends HttpError {
    constructor(message = 'Bad request') {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends HttpError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends HttpError {
    constructor(message = 'Not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class MethodNotAllowedError extends HttpError {
    constructor(message = 'Method not allowed') {
        super(message, 405);
    }
}
exports.MethodNotAllowedError = MethodNotAllowedError;
class ConflictError extends HttpError {
    constructor(message = 'Conflict') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class UnprocessableEntityError extends HttpError {
    constructor(message = 'Unprocessable entity') {
        super(message, 422);
    }
}
exports.UnprocessableEntityError = UnprocessableEntityError;
class TooManyRequestsError extends HttpError {
    constructor(message = 'Too many requests') {
        super(message, 429);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class InternalServerError extends HttpError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }
}
exports.InternalServerError = InternalServerError;
class ServiceUnavailableError extends HttpError {
    constructor(message = 'Service unavailable') {
        super(message, 503);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
