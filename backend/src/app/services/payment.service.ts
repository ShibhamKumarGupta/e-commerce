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

  async createCheckoutSession(amount: number, orderItems: any[], orderId: string): Promise<any> {
    try {
      const lineItems = orderItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/buyer/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL}/buyer/payment-cancel?order_id=${orderId}`,
        metadata: {
          orderId: orderId
        }
      });

      return {
        sessionId: session.id,
        url: session.url
      };
    } catch (error: any) {
      throw ApiError.internal(`Checkout session creation failed: ${error.message}`);
    }
  }
}
