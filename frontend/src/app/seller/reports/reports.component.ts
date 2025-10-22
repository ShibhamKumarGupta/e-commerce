import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { SubOrderService } from '../../core/services/sub-order.service';

declare var Chart: any;

@Component({
  selector: 'app-seller-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class SellerReportsComponent implements OnInit, AfterViewInit {
  loading = false;
  selectedPeriod = 'month';
  
  stats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
    averageOrderValue: 0,
    pendingOrders: 0
  };

  ordersByStatus: any = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  };

  // Chart instances
  revenueChart: any;
  orderStatusChart: any;
  topProductsChart: any;
  salesTrendChart: any;

  constructor(
    private productService: ProductService,
    private subOrderService: SubOrderService
  ) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  loadReportData(): void {
    this.loading = true;

    // Load seller products stats
    this.productService.getSellerProductStats().subscribe({
      next: (stats) => {
        this.stats.totalProducts = stats.totalProducts;
        this.stats.activeProducts = stats.activeProducts;
      }
    });

    // Load seller sub-order stats
    this.subOrderService.getSellerStats().subscribe({
      next: (stats) => {
        this.stats.totalOrders = stats.totalSubOrders;
        this.stats.totalRevenue = stats.totalEarnings || 0;
        this.stats.averageOrderValue = this.stats.totalOrders > 0 
          ? this.stats.totalRevenue / this.stats.totalOrders 
          : 0;
        this.stats.pendingOrders = stats.pendingOrders;
      }
    });

    // Load orders by status
    this.subOrderService.getSellerOrdersByStatus().subscribe({
      next: (data) => {
        this.ordersByStatus = data;
        this.loading = false;
        this.initializeCharts();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getCurrentUserId(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user._id || '';
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
      this.createSalesTrendChart();
    }, 0);
  }

  createRevenueChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Fetch real monthly revenue data
    this.subOrderService.getSellerMonthlyRevenue().subscribe({
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
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
            this.ordersByStatus.pending,
            this.ordersByStatus.processing,
            this.ordersByStatus.shipped,
            this.ordersByStatus.delivered,
            this.ordersByStatus.cancelled
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
    this.subOrderService.getSellerTopProducts(5).subscribe({
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

  createSalesTrendChart(): void {
    const ctx = document.getElementById('salesTrendChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Fetch real sales trend data (order count per month)
    this.subOrderService.getSellerMonthlyRevenue().subscribe({
      next: (data) => {
        const salesTrend = data.map(d => d.orderCount);
        this.renderSalesTrendChart(ctx, salesTrend);
      },
      error: (error) => {
        console.error('Error loading sales trend:', error);
        // Fallback to empty data
        this.renderSalesTrendChart(ctx, Array(12).fill(0));
      }
    });
  }

  renderSalesTrendChart(ctx: HTMLCanvasElement, salesTrend: number[]): void {
    this.salesTrendChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Orders',
          data: salesTrend,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
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
