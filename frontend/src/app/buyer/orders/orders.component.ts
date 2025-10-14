import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  OrderStatus = OrderStatus;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders(this.currentPage, 10).subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.totalPages = response.pages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          alert('Order cancelled successfully');
          this.loadOrders();
        },
        error: (error) => {
          alert(error.message || 'Failed to cancel order');
        }
      });
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return 'badge-warning';
      case OrderStatus.PROCESSING: return 'badge-info';
      case OrderStatus.SHIPPED: return 'badge-info';
      case OrderStatus.DELIVERED: return 'badge-success';
      case OrderStatus.CANCELLED: return 'badge-danger';
      default: return 'badge-info';
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }
}
