import { UserRepository } from '../domain/repositories/user.repository';
import { IUser, UserRole } from '../domain/interfaces/user.interface';
import { ErrorHelper } from '../helpers/error.helper';
import { JWTHelper } from '../helpers/jwt.helper';

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
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterDTO): Promise<{ user: IUser; token: string }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    
    if (existingUser) {
      throw ErrorHelper.conflict('Email already registered');
    }

    const user = await this.userRepository.create(data as any);
    const token = JWTHelper.generateToken(user);

    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;

    return { user: userWithoutPassword as any, token };
  }

  async login(data: LoginDTO): Promise<{ user: IUser; token: string }> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw ErrorHelper.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ErrorHelper.forbidden('Account is deactivated');
    }

    const isPasswordValid = await user.comparePassword(data.password);

    if (!isPasswordValid) {
      throw ErrorHelper.unauthorized('Invalid email or password');
    }

    const token = JWTHelper.generateToken(user);

    const userObject = user.toObject();
    const { password, ...userWithoutPassword } = userObject;

    return { user: userWithoutPassword as any, token };
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ErrorHelper.notFound('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: Partial<IUser>): Promise<IUser> {
    delete data.password;
    delete data.role;
    delete (data as any).isActive;

    const user = await this.userRepository.updateById(userId, { $set: data } as any);

    if (!user) {
      throw ErrorHelper.notFound('User not found');
    }

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ _id: userId } as any, { select: '+password' });

    if (!user) {
      throw ErrorHelper.notFound('User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw ErrorHelper.unauthorized('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
  }
}
