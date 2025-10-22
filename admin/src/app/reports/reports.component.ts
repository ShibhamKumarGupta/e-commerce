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

    // Fetch real monthly revenue data
    this.orderService.getMonthlyRevenue().subscribe({
      next: (data) => {
        const monthlyRevenue = data.map(d => d.revenue);
        this.renderRevenueChart(ctx, monthlyRevenue);
      },
      error: (error) => {
        console.error('Error loading monthly revenue:', error);
        // Fallback to empty data
        this.renderRevenueChart(ctx, Array(12).fill(0));
      }
    });
  }

  renderRevenueChart(ctx: HTMLCanvasElement, monthlyRevenue: number[]): void {
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

    // Fetch real top products data
    this.orderService.getTopProducts(5).subscribe({
      next: (data) => {
        const topProducts = data.length > 0 ? data : [
          { name: 'No Data', totalSales: 0 }
        ];
        this.renderTopProductsChart(ctx, topProducts);
      },
      error: (error) => {
        console.error('Error loading top products:', error);
        // Fallback to empty data
        this.renderTopProductsChart(ctx, [{ name: 'No Data', totalSales: 0 }]);
      }
    });
  }

  renderTopProductsChart(ctx: HTMLCanvasElement, topProducts: any[]): void {
    this.topProductsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topProducts.map(p => p.name),
        datasets: [{
          label: 'Sales',
          data: topProducts.map(p => p.totalSales),
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

    // Fetch real user growth data
    this.userService.getMonthlyUserGrowth().subscribe({
      next: (data) => {
        const userGrowth = data.map(d => d.newUsers);
        this.renderUserGrowthChart(ctx, userGrowth);
      },
      error: (error) => {
        console.error('Error loading user growth:', error);
        // Fallback to empty data
        this.renderUserGrowthChart(ctx, Array(12).fill(0));
      }
    });
  }

  renderUserGrowthChart(ctx: HTMLCanvasElement, userGrowth: number[]): void {
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
