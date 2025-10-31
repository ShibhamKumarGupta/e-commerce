import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { UserRole } from '../../domain/interfaces/user.interface';
import './order.routes.swagger';

export class OrderRoutes {
  public router: Router;
  private orderController: OrderController;

  constructor() {
    this.router = Router();
    this.orderController = new OrderController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(AuthMiddleware.authenticate);

    this.router.post('/', this.orderController.createOrder);
    this.router.get('/my-orders', this.orderController.getUserOrders);
    this.router.patch('/:id/cancel', this.orderController.cancelOrder);

    this.router.get(
      '/seller/orders',
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.orderController.getSellerOrders
    );

    this.router.get(
      '/admin/all',
      AuthMiddleware.isAdminOrOrderManager,
      this.orderController.getAllOrders
    );

    this.router.get(
      '/admin/stats',
      AuthMiddleware.isAdminOrOrderManager,
      this.orderController.getOrderStats
    );

    this.router.get(
      '/admin/analytics/monthly-revenue',
      AuthMiddleware.isAdminOrOrderManager,
      this.orderController.getMonthlyRevenue
    );

    this.router.get(
      '/admin/analytics/top-products',
      AuthMiddleware.isAdminOrOrderManager,
      this.orderController.getTopProducts
    );

    this.router.patch(
      '/:id/status',
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.ORDER_MANAGER),
      this.orderController.updateOrderStatus
    );

    this.router.patch(
      '/:id/payment',
      this.orderController.updatePaymentStatus
    );

    this.router.get('/:id', this.orderController.getOrderById);
  }
}
