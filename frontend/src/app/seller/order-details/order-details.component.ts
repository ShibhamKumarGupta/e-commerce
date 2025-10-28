import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubOrderService } from '../../core/services/sub-order.service';

@Component({
  selector: 'app-seller-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class SellerOrderDetailsComponent implements OnInit {
  subOrder: any = null;
  loading = false;
  subOrderId: string = '';

  approvalStatuses = [
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'not_approved', label: 'Not Approved' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subOrderService: SubOrderService
  ) {}

  ngOnInit(): void {
    this.subOrderId = this.route.snapshot.params['id'];
    if (this.subOrderId) {
      this.loadOrderDetails();
    }
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.subOrderService.getSubOrderById(this.subOrderId).subscribe({
      next: (subOrder) => {
        this.subOrder = subOrder;
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


  updateApprovalStatus(newStatus: string): void {
    // Check if approval is already locked
    if (this.isApprovalLocked()) {
      alert('Cannot update approval status. Your approval decision has been locked and cannot be changed.');
      return;
    }

    const warningMessage = (newStatus === 'approved' || newStatus === 'not_approved')
      ? `Are you sure you want to ${newStatus === 'approved' ? 'approve' : 'reject'} this order? This action cannot be undone.`
      : `Update approval status to ${newStatus}?`;

    if (confirm(warningMessage)) {
      this.subOrderService.updateSellerApproval(this.subOrderId, newStatus).subscribe({
        next: () => {
          alert('Approval status updated successfully. Your decision has been locked.');
          this.loadOrderDetails();
        },
        error: (error: any) => {
          console.error('Error updating approval status:', error);
          const errorMessage = error?.error?.message || error?.message || 'Failed to update approval status';
          alert(errorMessage);
        }
      });
    }
  }

  isApprovalLocked(): boolean {
    // Once seller approves or rejects, they cannot change it
    return this.subOrder && 
           (this.subOrder.sellerApprovalStatus === 'approved' || 
            this.subOrder.sellerApprovalStatus === 'not_approved');
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

  getApprovalStatusClass(status: string): string {
    const statusClasses: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      not_approved: 'bg-red-100 text-red-800'
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


  goBack(): void {
    this.router.navigate(['/seller/orders']);
  }

  printOrder(): void {
    window.print();
  }
}
