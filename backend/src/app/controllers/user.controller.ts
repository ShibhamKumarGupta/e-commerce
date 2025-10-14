import { Response } from 'express';
import { UserService } from '../services/user.service';
import { ApiResponse } from '../utils/ApiResponse.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.userService.getAllUsers(req.query);
    ApiResponse.success(res, result, 'Users retrieved successfully');
  });

  getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.userService.getUserById(req.params.id);
    ApiResponse.success(res, { user }, 'User retrieved successfully');
  });

  updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.userService.updateUser(req.params.id, req.body);
    ApiResponse.success(res, { user }, 'User updated successfully');
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.userService.deleteUser(req.params.id);
    ApiResponse.success(res, null, 'User deleted successfully');
  });

  toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.userService.toggleUserStatus(req.params.id);
    ApiResponse.success(res, { user }, 'User status updated successfully');
  });

  getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.userService.getUserStats();
    ApiResponse.success(res, stats, 'User statistics retrieved successfully');
  });
}
