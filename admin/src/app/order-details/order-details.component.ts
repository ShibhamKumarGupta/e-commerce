import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../core/services/order.service';
import { PaymentService } from '../core/services/payment.service';
import { SubOrderService } from '../core/services/sub-order.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: any = null;
  subOrders: any[] = [];
  loading = false;
  orderId: string = '';
  refundLoading = false;
  subOrdersLoading = false;

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
    private orderService: OrderService,
    private paymentService: PaymentService,
    private subOrderService: SubOrderService
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
        this.loading = false;
        // Load sub-orders if this is a master order
        if (order.isMasterOrder) {
          this.loadSubOrders();
        }
      },
      error: (error) => {
        console.error('Error loading order details:', error);
        alert('Failed to load order details');
        this.loading = false;
        this.router.navigate(['/orders']);
      }
    });
  }

  loadSubOrders(): void {
    this.subOrdersLoading = true;
    this.subOrderService.getAllSubOrders({ masterOrder: this.orderId }).subscribe({
      next: (result) => {
        this.subOrders = result.subOrders || [];
        this.subOrdersLoading = false;
      },
      error: (error) => {
        console.error('Error loading sub-orders:', error);
        this.subOrdersLoading = false;
      }
    });
  }

  updateOrderStatus(newStatus: string): void {
    // Check if order is locked (cancelled)
    if (this.isOrderLocked()) {
      alert('Cannot update order status. Order has been cancelled and is locked.');
      return;
    }

    // Check if all sellers have responded (for multi-vendor orders)
    if (this.order.isMasterOrder && !this.allSellersResponded()) {
      alert('Cannot update order status. Please wait for all sellers to approve or reject their portion of the order.');
      return;
    }

    let warningMessage = '';
    if (newStatus === 'cancelled') {
      warningMessage = 'Are you sure you want to cancel this order? This action will lock the order status and cannot be changed later.';
    } else if (newStatus === 'delivered') {
      warningMessage = 'Are you sure you want to mark this order as delivered? This action will lock the order status and cannot be changed later.';
    } else {
      warningMessage = `Update order status to ${newStatus}?`;
    }

    if (confirm(warningMessage)) {
      this.orderService.updateOrderStatus(this.orderId, newStatus).subscribe({
        next: () => {
          const lockMessage = (newStatus === 'cancelled' || newStatus === 'delivered') ? '. Order is now locked.' : '';
          alert('Order status updated successfully' + lockMessage);
          this.loadOrderDetails();
        },
        error: (error) => {
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

  getApprovalStatusClass(status: string): string {
    const statusClasses: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      not_approved: 'bg-red-100 text-red-800'
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

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  printOrder(): void {
    window.print();
  }

  refundPayment(): void {
    if (!this.order.paymentResult || !this.order.paymentResult.id) {
      alert('No payment information found for this order');
      return;
    }

    if (this.order.paymentStatus === 'refunded') {
      alert('This payment has already been refunded');
      return;
    }

    if (this.order.paymentMethod !== 'stripe') {
      alert('Refunds are only available for Stripe payments');
      return;
    }

    const confirmRefund = confirm(
      `Are you sure you want to refund $${this.order.totalPrice.toFixed(2)} to the customer?\n\n` +
      `Payment ID: ${this.order.paymentResult.id}`
    );

    if (!confirmRefund) {
      return;
    }

    this.refundLoading = true;
    this.paymentService.refundPayment(this.order.paymentResult.id, this.orderId).subscribe({
      next: (result) => {
        alert(`Refund successful! Refund ID: ${result.id}`);
        // Update payment status to refunded
        this.orderService.updatePaymentStatus(this.orderId, 'refunded', result).subscribe({
          next: () => {
            this.loadOrderDetails();
            this.refundLoading = false;
          },
          error: (error) => {
            console.error('Error updating payment status:', error);
            this.refundLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error processing refund:', error);
        alert('Failed to process refund: ' + (error.message || 'Unknown error'));
        this.refundLoading = false;
      }
    });
  }

  canRefund(): boolean {
    // Refund only available when order status is 'cancelled'
    return this.order && 
           this.order.orderStatus === 'cancelled' &&
           this.order.paymentMethod === 'stripe' && 
           this.order.paymentStatus === 'paid' && 
           this.order.paymentResult && 
           this.order.paymentResult.id;
  }

  isOrderLocked(): boolean {
    // Once order is cancelled or delivered, admin cannot change the status
    return this.order && 
           (this.order.orderStatus === 'cancelled' || 
            this.order.orderStatus === 'delivered');
  }

  allSellersResponded(): boolean {
    if (!this.subOrders || this.subOrders.length === 0) {
      return true; // No sub-orders means single vendor, can proceed
    }
    
    // Check if all sub-orders have approval status other than 'pending'
    return this.subOrders.every(subOrder => 
      subOrder.sellerApprovalStatus === 'approved' || 
      subOrder.sellerApprovalStatus === 'not_approved'
    );
  }

  canUpdateOrderStatus(): boolean {
    if (!this.order) return false;
    
    // For multi-vendor orders, all sellers must respond first
    if (this.order.isMasterOrder) {
      return this.allSellersResponded();
    }
    
    return true;
  }
}
