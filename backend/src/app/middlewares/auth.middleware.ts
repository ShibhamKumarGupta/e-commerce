import { Response, NextFunction } from 'express';
import { JWTHelper } from '../helpers/jwt.helper';
import { ErrorHelper } from '../helpers/error.helper';
import { UserRepository } from '../domain/repositories/user.repository';
import { UserRole } from '../domain/interfaces/user.interface';
import { asyncHandler } from '../utils/async.utils';
import { AuthRequest } from '../types/core.types';

export class AuthMiddleware {
  private static userRepository = new UserRepository();

  static authenticate = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ErrorHelper.unauthorized('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = JWTHelper.verifyToken(token);
      const user = await AuthMiddleware.userRepository.findById(decoded.id, { select: '-password' });

      if (!user) {
        throw ErrorHelper.unauthorized('User not found');
      }

      if (!user.isActive) {
        throw ErrorHelper.forbidden('Account is deactivated');
      }

      req.user = user;
      next();
    } catch (error) {
      throw ErrorHelper.unauthorized('Invalid token');
    }
  });

  static authorize(...roles: UserRole[]) {
    return asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw ErrorHelper.unauthorized('User not authenticated');
      }

      if (!roles.includes(req.user.role)) {
        throw ErrorHelper.forbidden('Access denied. Admin privileges required.');
      }

      next();
    });
  }

  static isAdmin = AuthMiddleware.authorize(UserRole.ADMIN);
  static isSeller = AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN);
  static isBuyer = AuthMiddleware.authorize(UserRole.BUYER, UserRole.ADMIN);
}
