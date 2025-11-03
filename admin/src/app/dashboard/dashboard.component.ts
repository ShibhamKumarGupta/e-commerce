import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../core/services/dashboard.service';
import { UserService } from '../core/services/user.service';
import { ProductService } from '../core/services/product.service';
import { OrderService } from '../core/services/order.service';
import { SubOrderService } from '../core/services/sub-order.service';
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
  isOrderManager = false;

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
      shippedOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      todayOrders: 0,
      todayRevenue: 0,
      averageOrderValue: 0
    }
  };

  // Order Manager specific stats
  urgentAlerts = {
    pendingOver24h: 0,
    paymentFailed: 0,
    cancelledToday: 0,
    readyToShip: 0
  };

  todayStats = {
    newOrders: 0,
    delivered: 0,
    shipped: 0,
    revenue: 0,
    avgOrder: 0,
    avgProcessingTime: 0
  };

  performanceMetrics = {
    fulfillmentRate: 0,
    dailyTarget: 100,
    dailyAchieved: 0,
    returnRate: 0,
    avgRating: 0
  };

  quickFilters = [
    { label: 'Pending Today', count: 0, status: 'pending' },
    { label: 'Ready to Ship', count: 0, status: 'processing' },
    { label: 'Issues', count: 0, status: 'cancelled' }
  ];

  recentActivity: any[] = [];

  commissionData: any = {
    totals: {
      totalEarnings: 0,
      totalCommission: 0,
      totalSubtotal: 0,
      orderCount: 0
    },
    breakdown: []
  };

  recentOrders: any[] = [];
  topProducts: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService,
    private subOrderService: SubOrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.isOrderManager = this.authService.isOrderManager;
    
    if (!this.authService.isAdminOrOrderManager) {
      alert('Access denied. Admin or Order Manager privileges required.');
      this.router.navigate(['/login']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    if (this.isOrderManager) {
      // Order Manager loads comprehensive order stats
      this.loadOrderManagerStats();
    } else {
      // Admin loads all stats
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
    }

    this.loadRecentOrders();
    
    // Only admin loads commission breakdown
    if (!this.isOrderManager) {
      this.loadCommissionBreakdown();
    }
  }

  loadOrderManagerStats(): void {
    // Fetch all orders to calculate comprehensive metrics
    this.orderService.getAllOrders({ limit: 1000 }).subscribe({
      next: (response) => {
        const allOrders = response.orders || [];
        this.calculateOrderManagerMetrics(allOrders);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order stats:', error);
        this.loading = false;
      }
    });
  }

  calculateOrderManagerMetrics(orders: any[]): void {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(todayStart);
    yesterday.setDate(yesterday.getDate() - 1);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Basic counts
    this.stats.orders.totalOrders = orders.length;
    this.stats.orders.pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
    this.stats.orders.processingOrders = orders.filter(o => o.orderStatus === 'processing').length;
    this.stats.orders.shippedOrders = orders.filter(o => o.orderStatus === 'shipped').length;
    this.stats.orders.deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    this.stats.orders.cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled').length;

    // Revenue calculations
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    this.stats.orders.totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    this.stats.orders.averageOrderValue = paidOrders.length > 0 
      ? this.stats.orders.totalRevenue / paidOrders.length 
      : 0;

    // Today's stats
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= todayStart);
    this.todayStats.newOrders = todayOrders.length;
    this.todayStats.delivered = orders.filter(o => 
      o.orderStatus === 'delivered' && new Date(o.deliveredAt) >= todayStart
    ).length;
    this.todayStats.shipped = orders.filter(o => 
      o.orderStatus === 'shipped' && new Date(o.updatedAt) >= todayStart
    ).length;
    
    const todayPaidOrders = todayOrders.filter(o => o.paymentStatus === 'paid');
    this.todayStats.revenue = todayPaidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    this.todayStats.avgOrder = todayPaidOrders.length > 0 
      ? this.todayStats.revenue / todayPaidOrders.length 
      : 0;

    // Calculate average processing time (in hours)
    const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered' && o.deliveredAt);
    if (deliveredOrders.length > 0) {
      const totalProcessingTime = deliveredOrders.reduce((sum, o) => {
        const created = new Date(o.createdAt).getTime();
        const delivered = new Date(o.deliveredAt).getTime();
        return sum + (delivered - created);
      }, 0);
      const avgMilliseconds = totalProcessingTime / deliveredOrders.length;
      this.todayStats.avgProcessingTime = avgMilliseconds / (1000 * 60 * 60); // Convert to hours
    }

    // Urgent alerts
    this.urgentAlerts.pendingOver24h = orders.filter(o => 
      o.orderStatus === 'pending' && new Date(o.createdAt) < oneDayAgo
    ).length;
    
    this.urgentAlerts.paymentFailed = orders.filter(o => 
      o.paymentStatus === 'failed'
    ).length;
    
    this.urgentAlerts.cancelledToday = orders.filter(o => 
      o.orderStatus === 'cancelled' && new Date(o.updatedAt) >= todayStart
    ).length;
    
    this.urgentAlerts.readyToShip = orders.filter(o => 
      o.orderStatus === 'processing' && o.paymentStatus === 'paid'
    ).length;

    // Performance metrics
    const deliveredOnTime = deliveredOrders.filter(o => {
      const created = new Date(o.createdAt).getTime();
      const delivered = new Date(o.deliveredAt).getTime();
      const daysToDeliver = (delivered - created) / (1000 * 60 * 60 * 24);
      return daysToDeliver <= 7; // Assuming 7 days is on-time
    }).length;
    
    this.performanceMetrics.fulfillmentRate = deliveredOrders.length > 0 
      ? (deliveredOnTime / deliveredOrders.length) * 100 
      : 0;

    this.performanceMetrics.dailyAchieved = this.todayStats.newOrders;
    this.performanceMetrics.returnRate = this.stats.orders.cancelledOrders > 0 
      ? (this.stats.orders.cancelledOrders / this.stats.orders.totalOrders) * 100 
      : 0;

    // Quick filters
    this.quickFilters = [
      { label: 'Pending Today', count: todayOrders.filter(o => o.orderStatus === 'pending').length, status: 'pending' },
      { label: 'Ready to Ship', count: this.urgentAlerts.readyToShip, status: 'processing' },
      { label: 'Issues', count: this.urgentAlerts.paymentFailed + this.urgentAlerts.cancelledToday, status: 'cancelled' }
    ];

    this.stats.orders.todayOrders = this.todayStats.newOrders;
    this.stats.orders.todayRevenue = this.todayStats.revenue;

    // Recent activity - last 10 order events
    this.recentActivity = orders
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map(order => ({
        type: this.getActivityType(order.orderStatus),
        message: `Order #${order._id.slice(-6)} ${this.getActivityMessage(order.orderStatus)}`,
        time: order.updatedAt,
        orderId: order._id
      }));
  }

  getActivityType(status: string): 'order' | 'delivery' | 'cancel' | 'payment' {
    if (status === 'delivered') return 'delivery';
    if (status === 'cancelled') return 'cancel';
    if (status === 'pending') return 'payment';
    return 'order';
  }

  getActivityMessage(status: string): string {
    const messages: { [key: string]: string } = {
      'pending': 'is waiting for payment',
      'processing': 'is being processed',
      'shipped': 'has been shipped',
      'delivered': 'was delivered',
      'cancelled': 'was cancelled'
    };
    return messages[status] || 'status updated';
  }

  loadCommissionBreakdown(): void {
    this.subOrderService.getCommissionBreakdown().subscribe({
      next: (data) => {
        this.commissionData = data;
      },
      error: (error) => {
        console.error('Error loading commission breakdown:', error);
      }
    });
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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
