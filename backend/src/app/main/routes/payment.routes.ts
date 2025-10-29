import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';

/**
 * @swagger
 * /payment/config:
 *   get:
 *     tags: [Payment]
 *     summary: Get Stripe publishable key
 *     description: Retrieve the Stripe publishable key for client-side integration (public endpoint)
 *     responses:
 *       200:
 *         description: Publishable key retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     publishableKey:
 *                       type: string
 *                       example: pk_test_...
 *
 * /payment/create-intent:
 *   post:
 *     tags: [Payment]
 *     summary: Create payment intent
 *     description: Create a Stripe payment intent for processing payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 99.99
 *                 description: Amount in dollars
 *               currency:
 *                 type: string
 *                 example: usd
 *                 default: usd
 *               orderId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     clientSecret:
 *                       type: string
 *                       example: pi_xxxxx_secret_xxxxx
 *                     paymentIntentId:
 *                       type: string
 *                       example: pi_xxxxx
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /payment/create-checkout-session:
 *   post:
 *     tags: [Payment]
 *     summary: Create Stripe checkout session
 *     description: Create a hosted Stripe checkout session for payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               successUrl:
 *                 type: string
 *                 example: "http://localhost:4200/payment/success"
 *               cancelUrl:
 *                 type: string
 *                 example: "http://localhost:4200/payment/cancel"
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       example: cs_test_xxxxx
 *                     url:
 *                       type: string
 *                       example: https://checkout.stripe.com/pay/cs_test_xxxxx
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Order not found
 *
 * /payment/confirm:
 *   post:
 *     tags: [Payment]
 *     summary: Confirm payment
 *     description: Confirm a payment and update order status
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *               - orderId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *                 example: pi_xxxxx
 *               orderId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
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
 *                   example: Payment confirmed successfully
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Order or payment not found
 *
 * /payment/refund:
 *   post:
 *     tags: [Payment]
 *     summary: Refund payment (Admin only)
 *     description: Process a refund for a payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               amount:
 *                 type: number
 *                 example: 50.00
 *                 description: Amount to refund (optional, full refund if not specified)
 *               reason:
 *                 type: string
 *                 example: "Customer requested refund"
 *     responses:
 *       200:
 *         description: Refund processed successfully
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
 *                   example: Refund processed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     refundId:
 *                       type: string
 *                       example: re_xxxxx
 *                     amount:
 *                       type: number
 *                       example: 50.00
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Order not found
 */

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
