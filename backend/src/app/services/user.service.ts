import { AbstractService } from './abstracts/service.abstract';
import { UserRepository } from '../domain/repositories/user.repository';
import { IUser, UserRole } from '../domain/interfaces/user.interface';
import { ErrorHelper } from '../helpers/error.helper';

export interface UserQuery {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export class UserService extends AbstractService<IUser> {
  private userRepository: UserRepository;

  constructor() {
    const repository = new UserRepository();
    super(repository);
    this.userRepository = repository;
  }

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
    const total = await this.userRepository.count(filter);
    const users = await this.userRepository.find(filter, {
      select: '-password',
      limit,
      page,
      sort: { createdAt: -1 }
    });

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getUserById(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId, { select: '-password' });

    if (!user) {
      throw ErrorHelper.notFound('User not found');
    }

    return user;
  }

  async updateUser(userId: string, data: Partial<IUser>): Promise<IUser> {
    delete data.password;

    const user = await this.userRepository.updateById(userId, { $set: data } as any);

    if (!user) {
      throw ErrorHelper.notFound('User not found');
    }

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.deleteById(userId);

    if (!user) {
      throw ErrorHelper.notFound('User not found');
    }
  }

  async toggleUserStatus(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ErrorHelper.notFound('User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await this.userRepository.count({});
    const activeUsers = await this.userRepository.count({ isActive: true });
    const buyers = await this.userRepository.count({ role: UserRole.BUYER });
    const sellers = await this.userRepository.count({ role: UserRole.SELLER });
    const admins = await this.userRepository.count({ role: UserRole.ADMIN });

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
