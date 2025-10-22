import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';

export class PaymentRoutes {
  public router: Router;
  private paymentController: PaymentController;

  constructor() {
    this.router = Router();
    this.paymentController = new PaymentController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/config', this.paymentController.getPublishableKey);

    this.router.use(AuthMiddleware.authenticate);
    
    this.router.post('/create-intent', this.paymentController.createPaymentIntent);
    this.router.post('/create-checkout-session', this.paymentController.createCheckoutSession);
    this.router.post('/confirm', this.paymentController.confirmPayment);
    this.router.post('/refund', AuthMiddleware.isAdmin, this.paymentController.refundPayment);
  }
}
