import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { PaymentService } from '../../core/services/payment.service';
import { Cart } from '../../core/models/cart.model';
import { PaymentMethod } from '../../core/models/order.model';

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

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      if (cart.items.length === 0) {
        this.router.navigate(['/buyer/cart']);
      }
    });
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
      // Create order first, then redirect to Stripe
      this.createOrderAndRedirectToStripe(orderData);
    }
  }

  createOrderAndRedirectToStripe(orderData: any): void {
    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        // Prepare items for Stripe checkout
        const checkoutItems = this.cart.items.map(item => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : null
        }));

        // Create Stripe checkout session
        this.paymentService.createCheckoutSession(
          this.totalAmount,
          checkoutItems,
          order._id
        ).subscribe({
          next: (session) => {
            // Redirect to Stripe checkout page
            window.location.href = session.url;
          },
          error: (error) => {
            alert('Failed to create payment session: ' + (error.message || 'Unknown error'));
            this.loading = false;
          }
        });
      },
      error: (error) => {
        alert(error.message || 'Failed to place order');
        this.loading = false;
      }
    });
  }

  createOrder(orderData: any): void {
    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
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
