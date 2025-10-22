import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';

export class AuthRoutes {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', this.authController.register);
    this.router.post('/login', this.authController.login);
    this.router.get('/profile', AuthMiddleware.authenticate, this.authController.getProfile);
    this.router.put('/profile', AuthMiddleware.authenticate, this.authController.updateProfile);
    this.router.put('/change-password', AuthMiddleware.authenticate, this.authController.changePassword);
  }
}
