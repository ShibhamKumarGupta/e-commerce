import jwt from 'jsonwebtoken';
import { IUser } from '../models/User.model';

export class JWTUtil {
  private static readonly secret = process.env.JWT_SECRET || 'default_secret_key';
  private static readonly expiresIn = process.env.JWT_EXPIRE || '7d';

  static generateToken(user: IUser): string {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as string
    } as jwt.SignOptions);
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static decodeToken(token: string): any {
    return jwt.decode(token);
  }
}
