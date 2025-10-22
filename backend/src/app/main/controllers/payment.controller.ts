import { Response } from 'express';
import { PaymentService } from '../../services/payment.service';
import { ResponseUtils } from '../../utils/response.utils';
import { asyncHandler } from '../../utils/async.utils';
import { AuthRequest } from '../../types/core.types';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
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
    const { paymentIntentId, amount } = req.body;
    const result = await this.paymentService.refundPayment(paymentIntentId, amount);
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
