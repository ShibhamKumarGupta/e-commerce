import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private stripePromise: Promise<Stripe | null> | null = null;

  constructor(private apiService: ApiService) {}

  async initializeStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      const config = await this.getStripeConfig();
      this.stripePromise = loadStripe(config.publishableKey);
    }
    return this.stripePromise;
  }

  getStripeConfig(): Promise<{ publishableKey: string }> {
    return this.apiService.get<any>('/payment/config').pipe(
      map(response => response.data)
    ).toPromise() as Promise<{ publishableKey: string }>;
  }

  createPaymentIntent(amount: number, currency: string = 'usd', metadata?: any): Observable<any> {
    return this.apiService.post<any>('/payment/create-intent', {
      amount,
      currency,
      metadata
    }).pipe(
      map(response => response.data)
    );
  }

  confirmPayment(paymentIntentId: string): Observable<any> {
    return this.apiService.post<any>('/payment/confirm', {
      paymentIntentId
    }).pipe(
      map(response => response.data)
    );
  }
}
