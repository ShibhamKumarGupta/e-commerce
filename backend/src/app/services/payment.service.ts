import Stripe from 'stripe';
import { ErrorHelper } from '../helpers/error.helper';
import { EnvironmentConfig } from '../config/environment.config';

export class PaymentService {
  private stripe: Stripe | null = null;

  constructor() {
    const secretKey = EnvironmentConfig.stripeSecretKey;
    
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16'
      });
    }
  }

  private ensureStripeInitialized(): void {
    if (!this.stripe) {
      throw ErrorHelper.internal('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
    }
  }

  async createPaymentIntent(amount: number, currency: string = 'inr', metadata?: any): Promise<any> {
    this.ensureStripeInitialized();
    try {
      const paymentIntent = await this.stripe!.paymentIntents.create({
        amount: Math.round(amount * 100),
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
      throw ErrorHelper.internal(`Payment intent creation failed: ${error.message}`);
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<any> {
    this.ensureStripeInitialized();
    try {
      const paymentIntent = await this.stripe!.paymentIntents.retrieve(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      };
    } catch (error: any) {
      throw ErrorHelper.internal(`Payment confirmation failed: ${error.message}`);
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<any> {
    this.ensureStripeInitialized();
    try {
      // Check if this is a checkout session ID instead of payment intent
      if (paymentIntentId.startsWith('cs_')) {
        // Retrieve the checkout session to get the payment intent
        const session = await this.stripe!.checkout.sessions.retrieve(paymentIntentId);
        
        if (!session.payment_intent) {
          throw new Error('No payment intent found for this checkout session');
        }

        paymentIntentId = session.payment_intent as string;
      }

      const refund = await this.stripe!.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined
      });

      return {
        id: refund.id,
        paymentIntentId: paymentIntentId,
        status: refund.status,
        amount: refund.amount / 100,
        currency: refund.currency
      };
    } catch (error: any) {
      throw ErrorHelper.internal(`Refund failed: ${error.message}`);
    }
  }

  getPublishableKey(): string {
    return EnvironmentConfig.stripePublishableKey;
  }

  async createCheckoutSession(amount: number, orderItems: any[], orderId: string): Promise<any> {
    this.ensureStripeInitialized();
    try {
      // Create a single line item for the total amount including tax and shipping
      // This ensures the buyer pays the correct total amount
      const lineItems = [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `Order #${orderId.slice(-8).toUpperCase()}`,
            description: `${orderItems.length} item(s) - Including tax and shipping`,
          },
          unit_amount: Math.round(amount * 100), // Total amount including tax and shipping
        },
        quantity: 1,
      }];

      const session = await this.stripe!.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${EnvironmentConfig.corsOrigins[0]}/buyer/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
        cancel_url: `${EnvironmentConfig.corsOrigins[0]}/buyer/payment-cancel?order_id=${orderId}`,
        metadata: {
          orderId: orderId
        }
      });

      return {
        sessionId: session.id,
        url: session.url
      };
    } catch (error: any) {
      throw ErrorHelper.internal(`Checkout session creation failed: ${error.message}`);
    }
  }
}
