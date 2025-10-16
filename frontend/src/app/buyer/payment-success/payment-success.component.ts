import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  loading = true;
  orderId: string = '';
  sessionId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'];
      this.orderId = params['order_id'];

      if (this.orderId && this.sessionId) {
        // Update order payment status
        this.orderService.updatePaymentStatus(
          this.orderId,
          'paid',
          { id: this.sessionId, status: 'succeeded', update_time: new Date().toISOString() }
        ).subscribe({
          next: () => {
            this.loading = false;
          },
          error: (error) => {
            console.error('Error updating payment status:', error);
            this.loading = false;
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  goToOrders(): void {
    this.router.navigate(['/buyer/orders']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
