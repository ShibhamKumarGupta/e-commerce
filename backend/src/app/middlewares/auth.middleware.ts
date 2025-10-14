import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt.util';
import { ApiError } from '../utils/ApiError.util';
import { User, UserRole } from '../models/User.model';
import { asyncHandler } from '../utils/asyncHandler.util';

export interface AuthRequest extends Request {
  user?: any;
}

export class AuthMiddleware {
  static authenticate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = JWTUtil.verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        throw ApiError.unauthorized('User not found');
      }

      if (!user.isActive) {
        throw ApiError.forbidden('Account is deactivated');
      }

      req.user = user;
      next();
    } catch (error) {
      throw ApiError.unauthorized('Invalid token');
    }
  });

  static authorize(...roles: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw ApiError.unauthorized('User not authenticated');
      }

      if (!roles.includes(req.user.role)) {
        throw ApiError.forbidden('You do not have permission to perform this action');
      }

      next();
    };
  }

  static isAdmin = AuthMiddleware.authorize(UserRole.ADMIN);
  static isSeller = AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN);
  static isBuyer = AuthMiddleware.authorize(UserRole.BUYER, UserRole.ADMIN);
}
