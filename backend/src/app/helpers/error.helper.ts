export class ErrorHelper extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): ErrorHelper {
    return new ErrorHelper(400, message);
  }

  static unauthorized(message: string = 'Unauthorized'): ErrorHelper {
    return new ErrorHelper(401, message);
  }

  static forbidden(message: string = 'Forbidden'): ErrorHelper {
    return new ErrorHelper(403, message);
  }

  static notFound(message: string = 'Resource not found'): ErrorHelper {
    return new ErrorHelper(404, message);
  }

  static conflict(message: string): ErrorHelper {
    return new ErrorHelper(409, message);
  }

  static internal(message: string = 'Internal server error'): ErrorHelper {
    return new ErrorHelper(500, message, false);
  }

  static validationError(message: string): ErrorHelper {
    return new ErrorHelper(422, message);
  }
}
