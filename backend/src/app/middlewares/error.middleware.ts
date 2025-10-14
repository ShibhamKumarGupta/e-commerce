import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.util';

export class ErrorMiddleware {
  static handle(err: any, req: Request, res: Response, next: NextFunction) {
    let error = err;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors)
        .map((e: any) => e.message)
        .join(', ');
      error = ApiError.badRequest(message);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const message = `${field} already exists`;
      error = ApiError.conflict(message);
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
      const message = `Invalid ${err.path}: ${err.value}`;
      error = ApiError.badRequest(message);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Token expired');
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }

  static notFound(req: Request, res: Response, next: NextFunction) {
    const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
    next(error);
  }
}
