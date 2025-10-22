import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types/core.types';
import { IUser } from '../domain/interfaces/user.interface';

export class JWTHelper {
  private static readonly secret = process.env.JWT_SECRET || 'default_secret_key';
  private static readonly expiresIn = process.env.JWT_EXPIRE || '7d';

  static generateToken(user: IUser): string {
    const payload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn
    } as jwt.SignOptions);
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    return jwt.decode(token) as TokenPayload | null;
  }

  static refreshToken(user: IUser): string {
    return this.generateToken(user);
  }
}
