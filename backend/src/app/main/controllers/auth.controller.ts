import { Response } from 'express';
import { AuthService } from '../../services/auth.service';
import { ResponseUtils } from '../../utils/response.utils';
import { asyncHandler } from '../../utils/async.utils';
import { AuthRequest } from '../../types/core.types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.authService.register(req.body);
    ResponseUtils.created(res, result, 'User registered successfully');
  });

  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.authService.login(req.body);
    ResponseUtils.success(res, result, 'Login successful');
  });

  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.authService.getProfile(req.user!._id.toString());
    ResponseUtils.success(res, { user }, 'Profile retrieved successfully');
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await this.authService.updateProfile(req.user!._id.toString(), req.body);
    ResponseUtils.success(res, { user }, 'Profile updated successfully');
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    await this.authService.changePassword(req.user!._id.toString(), currentPassword, newPassword);
    ResponseUtils.success(res, null, 'Password changed successfully');
  });
}
