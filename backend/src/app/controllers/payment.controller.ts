import { Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { ApiResponse } from '../utils/ApiResponse.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  createPaymentIntent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { amount, currency, metadata } = req.body;
    const result = await this.paymentService.createPaymentIntent(amount, currency, metadata);
    ApiResponse.success(res, result, 'Payment intent created successfully');
  });

  confirmPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paymentIntentId } = req.body;
    const result = await this.paymentService.confirmPayment(paymentIntentId);
    ApiResponse.success(res, result, 'Payment confirmed successfully');
  });

  refundPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paymentIntentId, amount } = req.body;
    const result = await this.paymentService.refundPayment(paymentIntentId, amount);
    ApiResponse.success(res, result, 'Refund processed successfully');
  });

  getPublishableKey = asyncHandler(async (req: AuthRequest, res: Response) => {
    const publishableKey = this.paymentService.getPublishableKey();
    ApiResponse.success(res, { publishableKey }, 'Publishable key retrieved successfully');
  });
}
