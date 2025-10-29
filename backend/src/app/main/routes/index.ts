import { Router } from 'express';
import { AuthRoutes } from './auth.routes';
import { UserRoutes } from './user.routes';
import { ProductRoutes } from './product.routes';
import { OrderRoutes } from './order.routes';
import { SubOrderRoutes } from './subOrder.routes';
import { PaymentRoutes } from './payment.routes';
import categoryRoutes from './category.routes';

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Check if the API server is running properly
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 */

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
    this.router.use('/categories', categoryRoutes);

    this.router.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
      });
    });
  }
}
