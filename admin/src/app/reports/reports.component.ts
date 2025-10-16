import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DashboardService } from '../core/services/dashboard.service';
import { OrderService } from '../core/services/order.service';
import { ProductService } from '../core/services/product.service';
import { UserService } from '../core/services/user.service';

declare var Chart: any;

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, AfterViewInit {
  loading = false;
  selectedPeriod = 'month';
  
  stats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    averageOrderValue: 0,
    conversionRate: 0
  };

  orderStats: any = {};
  productStats: any = {};
  userStats: any = {};

  // Chart instances
  revenueChart: any;
  orderStatusChart: any;
  topProductsChart: any;
  userGrowthChart: any;

  constructor(
    private dashboardService: DashboardService,
    private orderService: OrderService,
    private productService: ProductService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  loadReportData(): void {
    this.loading = true;

    // Load all stats
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.totalRevenue = data.orders.totalRevenue;
        this.stats.totalOrders = data.orders.totalOrders;
        this.stats.totalProducts = data.products.totalProducts;
        this.stats.totalUsers = data.users.totalUsers;
        this.stats.averageOrderValue = this.stats.totalOrders > 0 
          ? this.stats.totalRevenue / this.stats.totalOrders 
          : 0;
        this.stats.conversionRate = 12.5; // Mock data
        
        this.orderStats = data.orders;
        this.productStats = data.products;
        this.userStats = data.users;
        
        this.loading = false;
        this.initializeCharts();
      },
      error: (error) => {
        console.error('Error loading report data:', error);
        this.loading = false;
      }
    });
  }

  initializeCharts(): void {
    // Wait for Chart.js to be loaded
    if (typeof Chart === 'undefined') {
      setTimeout(() => this.initializeCharts(), 100);
      return;
    }
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      this.createRevenueChart();
      this.createOrderStatusChart();
      this.createTopProductsChart();
      this.createUserGrowthChart();
    }, 0);
  }

  createRevenueChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Mock monthly revenue data
    const monthlyRevenue = [
      15000, 18000, 22000, 19000, 25000, 28000, 
      32000, 30000, 35000, 38000, 42000, 45000
    ];

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue ($)',
          data: monthlyRevenue,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                return 'Revenue: $' + context.parsed.y.toLocaleString();
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: any) => '$' + value.toLocaleString()
            }
          }
        }
      }
    });
  }

  createOrderStatusChart(): void {
    const ctx = document.getElementById('orderStatusChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.orderStatusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        datasets: [{
          data: [
            this.orderStats.pendingOrders || 0,
            this.orderStats.processingOrders || 0,
            this.orderStats.shippedOrders || 0,
            this.orderStats.deliveredOrders || 0,
            this.orderStats.cancelledOrders || 0
          ],
          backgroundColor: [
            'rgb(251, 191, 36)',
            'rgb(59, 130, 246)',
            'rgb(168, 85, 247)',
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  createTopProductsChart(): void {
    const ctx = document.getElementById('topProductsChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Mock top products data
    const topProducts = [
      { name: 'Product A', sales: 150 },
      { name: 'Product B', sales: 120 },
      { name: 'Product C', sales: 100 },
      { name: 'Product D', sales: 85 },
      { name: 'Product E', sales: 70 }
    ];

    this.topProductsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topProducts.map(p => p.name),
        datasets: [{
          label: 'Sales',
          data: topProducts.map(p => p.sales),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createUserGrowthChart(): void {
    const ctx = document.getElementById('userGrowthChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Mock user growth data
    const userGrowth = [50, 75, 100, 140, 180, 220, 270, 320, 380, 450, 520, 600];

    this.userGrowthChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'New Users',
          data: userGrowth,
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgb(168, 85, 247)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  onPeriodChange(): void {
    // Reload data based on selected period
    this.loadReportData();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  exportReport(): void {
    alert('Export functionality will be implemented with backend support');
  }

  printReport(): void {
    window.print();
  }
}
