import { User, IUser, UserRole } from '../models/User.model';
import { ApiError } from '../utils/ApiError.util';
import { JWTUtil } from '../utils/jwt.util';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterDTO): Promise<{ user: IUser; token: string }> {
    const existingUser = await User.findOne({ email: data.email });
    
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const user = await User.create(data);
    const token = JWTUtil.generateToken(user);

    // Remove password from response
    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;

    return { user: userWithoutPassword as any, token };
  }

  async login(data: LoginDTO): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: data.email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const isPasswordValid = await user.comparePassword(data.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = JWTUtil.generateToken(user);

    // Remove password from response
    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;

    return { user: userWithoutPassword as any, token };
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: Partial<IUser>): Promise<IUser> {
    // Prevent updating sensitive fields
    delete data.password;
    delete data.role;
    delete (data as any).isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
  }
}
