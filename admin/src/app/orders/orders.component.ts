import { Component, OnInit } from '@angular/core';
import { OrderService } from '../core/services/order.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalOrders = 0;
  limit = 10;

  // Filters
  selectedStatus = '';
  selectedPaymentStatus = '';
  searchQuery = '';

  // Selected order for actions
  selectedOrder: any = null;
  showStatusModal = false;
  newOrderStatus = '';

  orderStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  paymentStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;

    const query: any = {
      page: this.currentPage,
      limit: this.limit
    };

    if (this.selectedStatus) query.status = this.selectedStatus;
    if (this.selectedPaymentStatus) query.paymentStatus = this.selectedPaymentStatus;

    this.orderService.getAllOrders(query).subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.totalOrders = response.total;
        this.totalPages = response.pages;
        this.currentPage = response.page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.selectedPaymentStatus = '';
    this.currentPage = 1;
    this.loadOrders();
  }

  openStatusModal(order: any): void {
    this.selectedOrder = order;
    this.newOrderStatus = order.orderStatus;
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedOrder = null;
    this.newOrderStatus = '';
  }

  updateOrderStatus(): void {
    if (this.selectedOrder && this.newOrderStatus) {
      this.orderService.updateOrderStatus(this.selectedOrder._id, this.newOrderStatus).subscribe({
        next: () => {
          alert('Order status updated successfully');
          this.closeStatusModal();
          this.loadOrders();
        },
        error: (error) => {
          console.error('Error updating order status:', error);
          alert('Failed to update order status');
        }
      });
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getOrderStats(): any {
    const stats = {
      total: this.totalOrders,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0
    };

    this.orders.forEach(order => {
      if (order.orderStatus === 'pending') stats.pending++;
      if (order.orderStatus === 'processing') stats.processing++;
      if (order.orderStatus === 'shipped') stats.shipped++;
      if (order.orderStatus === 'delivered') stats.delivered++;
    });

    return stats;
  }
}
