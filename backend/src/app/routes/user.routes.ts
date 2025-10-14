import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

export class UserRoutes {
  public router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All routes require authentication and admin role
    this.router.use(AuthMiddleware.authenticate);
    this.router.use(AuthMiddleware.isAdmin);

    this.router.get('/', this.userController.getAllUsers);
    this.router.get('/stats', this.userController.getUserStats);
    this.router.get('/:id', this.userController.getUserById);
    this.router.put('/:id', this.userController.updateUser);
    this.router.delete('/:id', this.userController.deleteUser);
    this.router.patch('/:id/toggle-status', this.userController.toggleUserStatus);
  }
}
