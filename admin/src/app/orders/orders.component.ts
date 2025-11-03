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
  selectedPaymentMethod = '';
  startDate = '';
  endDate = '';

  // Stats
  stats = {
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    revenue: 0
  };

  // Bulk Actions
  selectedOrders: Set<string> = new Set();
  showBulkActions = false;

  // Quick View
  showQuickViewModal = false;
  quickViewOrder: any = null;

  // Active Tab
  activeTab = 'all';

  // Selected order for actions
  selectedOrder: any = null;
  showStatusModal = false;
  newOrderStatus = '';

  // Quick Action Menu
  activeActionMenu: string | null = null;

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

  paymentMethods = [
    { value: 'cod', label: 'Cash on Delivery' },
    { value: 'stripe', label: 'Stripe' }
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadStats();
  }

  loadOrders(): void {
    this.loading = true;

    const query: any = {
      page: this.currentPage,
      limit: this.limit
    };

    if (this.selectedStatus) query.status = this.selectedStatus;
    if (this.selectedPaymentStatus) query.paymentStatus = this.selectedPaymentStatus;
    if (this.selectedPaymentMethod) query.paymentMethod = this.selectedPaymentMethod;
    if (this.searchQuery) query.search = this.searchQuery;
    if (this.startDate) query.startDate = this.startDate;
    if (this.endDate) query.endDate = this.endDate;

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

  loadStats(): void {
    // Load all orders to calculate stats
    this.orderService.getAllOrders({ limit: 1000 }).subscribe({
      next: (response) => {
        const allOrders = response.orders;
        this.stats = {
          total: allOrders.length,
          pending: allOrders.filter((o: any) => o.orderStatus === 'pending').length,
          processing: allOrders.filter((o: any) => o.orderStatus === 'processing').length,
          delivered: allOrders.filter((o: any) => o.orderStatus === 'delivered').length,
          revenue: allOrders
            .filter((o: any) => o.paymentStatus === 'paid')
            .reduce((sum: number, o: any) => sum + o.totalPrice, 0)
        };
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    this.currentPage = 1;
    
    // Set status filter based on tab
    if (tab === 'all') {
      this.selectedStatus = '';
    } else {
      this.selectedStatus = tab;
    }
    
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
    this.selectedPaymentMethod = '';
    this.searchQuery = '';
    this.startDate = '';
    this.endDate = '';
    this.activeTab = 'all';
    this.currentPage = 1;
    this.loadOrders();
  }

  // Bulk Actions
  toggleOrderSelection(orderId: string): void {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
    this.showBulkActions = this.selectedOrders.size > 0;
  }

  toggleSelectAll(): void {
    if (this.selectedOrders.size === this.orders.length) {
      this.selectedOrders.clear();
    } else {
      this.orders.forEach(order => this.selectedOrders.add(order._id));
    }
    this.showBulkActions = this.selectedOrders.size > 0;
  }

  isOrderSelected(orderId: string): boolean {
    return this.selectedOrders.has(orderId);
  }

  isAllSelected(): boolean {
    return this.orders.length > 0 && this.selectedOrders.size === this.orders.length;
  }

  clearSelection(): void {
    this.selectedOrders.clear();
    this.showBulkActions = false;
  }

  exportSelected(): void {
    const selectedOrdersData = this.orders.filter(o => this.selectedOrders.has(o._id));
    console.log('Exporting:', selectedOrdersData);
    alert(`Exporting ${selectedOrdersData.length} orders...`);
    // TODO: Implement CSV/Excel export
  }

  // Quick View
  openQuickView(order: any): void {
    this.quickViewOrder = order;
    this.showQuickViewModal = true;
  }

  closeQuickView(): void {
    this.showQuickViewModal = false;
    this.quickViewOrder = null;
  }

  // Action Menu
  toggleActionMenu(orderId: string): void {
    this.activeActionMenu = this.activeActionMenu === orderId ? null : orderId;
  }

  closeActionMenu(): void {
    this.activeActionMenu = null;
  }

  openStatusModal(order: any): void {
    // Check if order is locked before allowing status change
    if (this.isOrderLocked(order)) {
      const finalStatus = order.orderStatus === 'cancelled' ? 'Cancelled' : 'Delivered';
      alert(`🔒 This order is locked. ${finalStatus} status is final and cannot be changed.`);
      return;
    }
    
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
      // Double-check lock status before updating
      if (this.isOrderLocked(this.selectedOrder)) {
        alert('🔒 This order is locked and cannot be modified.');
        this.closeStatusModal();
        return;
      }

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

  isOrderLocked(order: any): boolean {
    // Once order is cancelled or delivered, status cannot be changed
    return order && 
           (order.orderStatus === 'cancelled' || 
            order.orderStatus === 'delivered');
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

  getPaymentMethodClass(method: string): string {
    const methodClasses: any = {
      cod: 'bg-orange-100 text-orange-800',
      stripe: 'bg-blue-100 text-blue-800'
    };
    return methodClasses[method.toLowerCase()] || 'bg-gray-100 text-gray-800';
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

  getTabCount(status: string): number {
    if (status === 'all') return this.stats.total;
    if (status === 'pending') return this.stats.pending;
    if (status === 'processing') return this.stats.processing;
    if (status === 'delivered') return this.stats.delivered;
    if (status === 'shipped') return this.orders.filter(o => o.orderStatus === 'shipped').length;
    if (status === 'cancelled') return this.orders.filter(o => o.orderStatus === 'cancelled').length;
    return 0;
  }

  getShippedCount(): number {
    return this.orders.filter(o => o.orderStatus === 'shipped').length;
  }

  getCancelledCount(): number {
    return this.orders.filter(o => o.orderStatus === 'cancelled').length;
  }
}
