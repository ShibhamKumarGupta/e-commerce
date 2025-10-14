import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.authService.register(req.body);
    ApiResponse.created(res, result, 'User registered successfully');
  });

  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.authService.login(req.body);
    ApiResponse.success(res, result, 'Login successful');
  });

  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.authService.getProfile(req.user._id);
    ApiResponse.success(res, { user }, 'Profile retrieved successfully');
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.authService.updateProfile(req.user._id, req.body);
    ApiResponse.success(res, { user }, 'Profile updated successfully');
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    await this.authService.changePassword(req.user._id, currentPassword, newPassword);
    ApiResponse.success(res, null, 'Password changed successfully');
  });
}
