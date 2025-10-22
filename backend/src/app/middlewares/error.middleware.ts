import { Request, Response, NextFunction } from 'express';
import { ErrorHelper } from '../helpers/error.helper';
import { EnvironmentConfig } from '../config/environment.config';

export class ErrorMiddleware {
  static handle(err: any, req: Request, res: Response, next: NextFunction) {
    let error = err;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors)
        .map((e: any) => e.message)
        .join(', ');
      error = ErrorHelper.badRequest(message);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const message = `${field} already exists`;
      error = ErrorHelper.conflict(message);
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
      const message = `Invalid ${err.path}: ${err.value}`;
      error = ErrorHelper.badRequest(message);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = ErrorHelper.unauthorized('Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
      error = ErrorHelper.unauthorized('Token expired');
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      message,
      ...(EnvironmentConfig.isDevelopment && { stack: error.stack })
    });
  }

  static notFound(req: Request, res: Response, next: NextFunction) {
    const error = ErrorHelper.notFound(`Route ${req.originalUrl} not found`);
    next(error);
  }
}
