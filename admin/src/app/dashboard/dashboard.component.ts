import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../core/services/dashboard.service';
import { UserService } from '../core/services/user.service';
import { ProductService } from '../core/services/product.service';
import { OrderService } from '../core/services/order.service';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = false;
  currentUser: any = null;

  stats = {
    users: {
      totalUsers: 0,
      activeUsers: 0,
      buyers: 0,
      sellers: 0,
      admins: 0
    },
    products: {
      totalProducts: 0,
      activeProducts: 0,
      outOfStock: 0,
      lowStock: 0
    },
    orders: {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      deliveredOrders: 0,
      totalRevenue: 0
    }
  };

  recentOrders: any[] = [];
  topProducts: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    
    if (!this.authService.isAdmin) {
      alert('Access denied. Admin privileges required.');
      this.router.navigate(['/login']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.loading = false;
      }
    });

    this.loadRecentOrders();
  }

  loadRecentOrders(): void {
    this.dashboardService.getRecentOrders(5).subscribe({
      next: (orders) => {
        this.recentOrders = orders;
      },
      error: (error) => {
        console.error('Error loading recent orders:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: any = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
