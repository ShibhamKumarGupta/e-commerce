import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User.model';

export class OrderRoutes {
  public router: Router;
  private orderController: OrderController;

  constructor() {
    this.router = Router();
    this.orderController = new OrderController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // All routes require authentication
    this.router.use(AuthMiddleware.authenticate);

    // Buyer routes
    this.router.post('/', this.orderController.createOrder);
    this.router.get('/my-orders', this.orderController.getUserOrders);
    this.router.patch('/:id/cancel', this.orderController.cancelOrder);

    // Seller routes
    this.router.get(
      '/seller/orders',
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.orderController.getSellerOrders
    );

    // Admin routes
    this.router.get(
      '/admin/all',
      AuthMiddleware.isAdmin,
      this.orderController.getAllOrders
    );

    this.router.get(
      '/admin/stats',
      AuthMiddleware.isAdmin,
      this.orderController.getOrderStats
    );

    this.router.patch(
      '/:id/status',
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.orderController.updateOrderStatus
    );

    this.router.patch(
      '/:id/payment',
      this.orderController.updatePaymentStatus
    );

    // Common route
    this.router.get('/:id', this.orderController.getOrderById);
  }
}
