import { Response } from 'express';
import { UserService } from '../../services/user.service';
import { ResponseUtils } from '../../utils/response.utils';
import { asyncHandler } from '../../utils/async.utils';
import { AuthRequest } from '../../types/core.types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.userService.getAllUsers(req.query);
    ResponseUtils.success(res, result, 'Users retrieved successfully');
  });

  getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.userService.getUserById(req.params.id);
    ResponseUtils.success(res, { user }, 'User retrieved successfully');
  });

  updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.userService.updateUser(req.params.id, req.body);
    ResponseUtils.success(res, { user }, 'User updated successfully');
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.userService.deleteUser(req.params.id);
    ResponseUtils.success(res, null, 'User deleted successfully');
  });

  toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.userService.toggleUserStatus(req.params.id);
    ResponseUtils.success(res, { user }, 'User status updated successfully');
  });

  getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.userService.getUserStats();
    ResponseUtils.success(res, stats, 'User statistics retrieved successfully');
  });
}
