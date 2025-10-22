import { Router } from 'express';
import { SubOrderController } from '../controllers/subOrder.controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { UserRole } from '../../domain/interfaces/user.interface';

export class SubOrderRoutes {
  public router: Router;
  private subOrderController: SubOrderController;

  constructor() {
    this.router = Router();
    this.subOrderController = new SubOrderController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(AuthMiddleware.authenticate);

    this.router.get(
      '/seller/my-orders',
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.subOrderController.getSellerSubOrders
    );

    this.router.get(
      '/seller/earnings',
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.subOrderController.getSellerEarnings
    );

    this.router.get(
      '/seller/stats',
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.subOrderController.getSellerStats
    );

    this.router.patch(
      '/:id/status',
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.subOrderController.updateSubOrderStatus
    );

    this.router.get(
      '/admin/all',
      AuthMiddleware.isAdmin,
      this.subOrderController.getAllSubOrders
    );

    this.router.get(
      '/admin/commission-breakdown',
      AuthMiddleware.isAdmin,
      this.subOrderController.getCommissionBreakdown
    );

    this.router.get('/:id', this.subOrderController.getSubOrderById);
  }
}
