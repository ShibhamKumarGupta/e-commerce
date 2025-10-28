import { Response } from 'express';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../services/order.service';
import { ResponseUtils } from '../../utils/response.utils';
import { asyncHandler } from '../../utils/async.utils';
import { AuthRequest } from '../../types/core.types';

export class PaymentController {
  private paymentService: PaymentService;
  private orderService: OrderService;

  constructor() {
    this.paymentService = new PaymentService();
    this.orderService = new OrderService();
  }

  createPaymentIntent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { amount, currency, metadata } = req.body;
    const result = await this.paymentService.createPaymentIntent(amount, currency, metadata);
    ResponseUtils.success(res, result, 'Payment intent created successfully');
  });

  confirmPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paymentIntentId } = req.body;
    const result = await this.paymentService.confirmPayment(paymentIntentId);
    ResponseUtils.success(res, result, 'Payment confirmed successfully');
  });

  refundPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paymentIntentId, amount, orderId } = req.body;
    const result = await this.paymentService.refundPayment(paymentIntentId, amount);
    
    // Save refund result to order if orderId is provided
    if (orderId) {
      await this.orderService.updateRefundResult(orderId, result);
    }
    
    ResponseUtils.success(res, result, 'Refund processed successfully');
  });

  getPublishableKey = asyncHandler(async (req: AuthRequest, res: Response) => {
    const publishableKey = this.paymentService.getPublishableKey();
    ResponseUtils.success(res, { publishableKey }, 'Publishable key retrieved successfully');
  });

  createCheckoutSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { amount, orderItems, orderId } = req.body;
    const result = await this.paymentService.createCheckoutSession(amount, orderItems, orderId);
    ResponseUtils.success(res, result, 'Checkout session created successfully');
  });
}
