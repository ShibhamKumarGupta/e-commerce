import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-seller-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class SellerOrderDetailsComponent implements OnInit {
  order: any = null;
  loading = false;
  orderId: string = '';
  sellerItems: any[] = [];

  orderStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.params['id'];
    if (this.orderId) {
      this.loadOrderDetails();
    }
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        // Filter items that belong to this seller
        const currentUserId = this.getCurrentUserId();
        this.sellerItems = order.orderItems.filter((item: any) => 
          item.seller && item.seller._id === currentUserId
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        alert('Failed to load order details');
        this.loading = false;
        this.router.navigate(['/seller/orders']);
      }
    });
  }

  getCurrentUserId(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user._id || '';
  }

  updateOrderStatus(newStatus: string): void {
    if (confirm(`Update order status to ${newStatus}?`)) {
      this.orderService.updateOrderStatus(this.orderId, newStatus).subscribe({
        next: () => {
          alert('Order status updated successfully');
          this.loadOrderDetails();
        },
        error: (error: any) => {
          console.error('Error updating order status:', error);
          alert('Failed to update order status');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const statusClasses: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getPaymentStatusClass(status: string): string {
    const statusClasses: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateSellerTotal(): number {
    return this.sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  goBack(): void {
    this.router.navigate(['/seller/orders']);
  }

  printOrder(): void {
    window.print();
  }
}
