import Stripe from 'stripe';
import { ApiError } from '../utils/ApiError.util';

export class PaymentService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('Stripe secret key is not configured');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16'
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd', metadata?: any): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error: any) {
      throw ApiError.internal(`Payment intent creation failed: ${error.message}`);
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<any> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      };
    } catch (error: any) {
      throw ApiError.internal(`Payment confirmation failed: ${error.message}`);
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<any> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined
      });

      return {
        id: refund.id,
        status: refund.status,
        amount: refund.amount / 100
      };
    } catch (error: any) {
      throw ApiError.internal(`Refund failed: ${error.message}`);
    }
  }

  getPublishableKey(): string {
    return process.env.STRIPE_PUBLISHABLE_KEY || '';
  }
}
