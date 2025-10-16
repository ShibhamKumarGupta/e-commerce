import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-seller-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class SellerOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalOrders = 0;
  limit = 10;

  // Filters
  selectedStatus = '';
  searchQuery = '';

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;

    this.orderService.getMyOrders(this.currentPage, this.limit).subscribe({
      next: (response) => {
        // Filter orders where current user is the seller
        this.orders = response.orders.filter((order: any) => {
          return order.orderItems.some((item: any) => 
            item.seller && item.seller._id === this.getCurrentUserId()
          );
        });
        
        // Apply status filter if selected
        if (this.selectedStatus) {
          this.orders = this.orders.filter(order => order.orderStatus === this.selectedStatus);
        }

        // Apply search filter
        if (this.searchQuery) {
          this.orders = this.orders.filter(order => 
            order._id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        }

        this.totalOrders = this.orders.length;
        this.totalPages = Math.ceil(this.totalOrders / this.limit);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  getCurrentUserId(): string {
    // Get current user ID from auth service or local storage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user._id || '';
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadOrders();
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/seller/orders', orderId]);
  }

  updateOrderStatus(orderId: string, newStatus: string): void {
    if (confirm(`Update order status to ${newStatus}?`)) {
      this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
        next: () => {
          alert('Order status updated successfully');
          this.loadOrders();
        },
        error: (error: any) => {
          console.error('Error updating order status:', error);
          alert('Failed to update order status');
        }
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      failed: 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
