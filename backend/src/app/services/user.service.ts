import { User, IUser, UserRole } from '../models/User.model';
import { ApiError } from '../utils/ApiError.util';

export interface UserQuery {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  async getAllUsers(query: UserQuery): Promise<{ users: IUser[]; total: number; page: number; pages: number }> {
    const { role, isActive, search, page = 1, limit = 10 } = query;
    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async updateUser(userId: string, data: Partial<IUser>): Promise<IUser> {
    // Prevent updating password through this method
    delete data.password;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }
  }

  async toggleUserStatus(userId: string): Promise<IUser> {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const buyers = await User.countDocuments({ role: UserRole.BUYER });
    const sellers = await User.countDocuments({ role: UserRole.SELLER });
    const admins = await User.countDocuments({ role: UserRole.ADMIN });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      buyers,
      sellers,
      admins
    };
  }
}
