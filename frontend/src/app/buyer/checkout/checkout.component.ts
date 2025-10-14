import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { Cart } from '../../core/models/cart.model';
import { PaymentMethod } from '../../core/models/order.model';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cart: Cart = { items: [], totalItems: 0, totalPrice: 0 };
  loading = false;
  
  paymentMethod: PaymentMethod = PaymentMethod.COD;
  PaymentMethod = PaymentMethod;
  
  // Stripe
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      if (cart.items.length === 0) {
        this.router.navigate(['/buyer/cart']);
      }
    });

    // Initialize Stripe
    this.stripe = await this.paymentService.initializeStripe();
    if (this.stripe) {
      this.elements = this.stripe.elements();
      setTimeout(() => this.mountCardElement(), 100);
    }
  }

  mountCardElement(): void {
    if (this.elements) {
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
            '::placeholder': { color: '#aab7c4' }
          }
        }
      });
      const cardContainer = document.getElementById('card-element');
      if (cardContainer) {
        this.cardElement.mount('#card-element');
      }
    }
  }

  get totalAmount(): number {
    const shipping = this.cart.totalPrice > 100 ? 0 : 10;
    const tax = this.cart.totalPrice * 0.1;
    return this.cart.totalPrice + shipping + tax;
  }

  async placeOrder(): Promise<void> {
    if (this.checkoutForm.invalid) {
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    const orderData = {
      orderItems: this.cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      shippingAddress: this.checkoutForm.value,
      paymentMethod: this.paymentMethod
    };

    if (this.paymentMethod === PaymentMethod.COD) {
      this.createOrder(orderData);
    } else {
      await this.processStripePayment(orderData);
    }
  }

  async processStripePayment(orderData: any): Promise<void> {
    try {
      // Create payment intent
      const paymentIntent = await this.paymentService.createPaymentIntent(
        this.totalAmount,
        'usd'
      ).toPromise();

      if (!this.stripe || !this.cardElement) {
        throw new Error('Stripe not initialized');
      }

      // Confirm payment
      const { error, paymentIntent: confirmedPayment } = await this.stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        { payment_method: { card: this.cardElement } }
      );

      if (error) {
        throw new Error(error.message);
      }

      // Create order with payment info
      this.createOrder(orderData, {
        id: confirmedPayment.id,
        status: confirmedPayment.status,
        update_time: new Date().toISOString()
      });
    } catch (error: any) {
      alert(error.message || 'Payment failed');
      this.loading = false;
    }
  }

  createOrder(orderData: any, paymentResult?: any): void {
    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        if (paymentResult) {
          this.orderService.updatePaymentStatus(order._id, 'paid', paymentResult).subscribe();
        }
        this.cartService.clearCart();
        alert('Order placed successfully!');
        this.router.navigate(['/buyer/orders']);
        this.loading = false;
      },
      error: (error) => {
        alert(error.message || 'Failed to place order');
        this.loading = false;
      }
    });
  }
}
