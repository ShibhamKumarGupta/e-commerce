import { Router } from 'express';
import { AuthRoutes } from './auth.routes';
import { UserRoutes } from './user.routes';
import { ProductRoutes } from './product.routes';
import { OrderRoutes } from './order.routes';
import { SubOrderRoutes } from './subOrder.routes';
import { PaymentRoutes } from './payment.routes';

export class AppRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/auth', new AuthRoutes().router);
    this.router.use('/users', new UserRoutes().router);
    this.router.use('/products', new ProductRoutes().router);
    this.router.use('/orders', new OrderRoutes().router);
    this.router.use('/sub-orders', new SubOrderRoutes().router);
    this.router.use('/payment', new PaymentRoutes().router);

    // Health check
    this.router.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
      });
    });
  }
}
