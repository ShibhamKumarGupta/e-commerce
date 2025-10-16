import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';

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
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  loadReportData(): void {
    this.loading = true;

    // Load seller products
    this.productService.getAllProducts({ limit: 100 }).subscribe({
      next: (response) => {
        this.stats.totalProducts = response.total;
        this.stats.activeProducts = response.products.filter(p => p.isActive).length;
      }
    });

    // Load seller orders
    this.orderService.getMyOrders(1, 100).subscribe({
      next: (response) => {
        const currentUserId = this.getCurrentUserId();
        
        // Filter orders that contain seller's products
        const sellerOrders = response.orders.filter((order: any) => {
          return order.orderItems.some((item: any) => 
            item.seller && item.seller._id === currentUserId
          );
        });

        this.stats.totalOrders = sellerOrders.length;
        
        // Calculate revenue from seller's items only
        this.stats.totalRevenue = sellerOrders.reduce((sum: number, order: any) => {
          const sellerItems = order.orderItems.filter((item: any) => 
            item.seller && item.seller._id === currentUserId
          );
          const orderTotal = sellerItems.reduce((itemSum: number, item: any) => 
            itemSum + (item.price * item.quantity), 0
          );
          return sum + (order.paymentStatus === 'paid' ? orderTotal : 0);
        }, 0);

        this.stats.averageOrderValue = this.stats.totalOrders > 0 
          ? this.stats.totalRevenue / this.stats.totalOrders 
          : 0;

        // Count orders by status
        sellerOrders.forEach((order: any) => {
          if (this.ordersByStatus.hasOwnProperty(order.orderStatus)) {
            this.ordersByStatus[order.orderStatus]++;
          }
        });

        this.stats.pendingOrders = this.ordersByStatus.pending;
        
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
    this.createRevenueChart();
    this.createOrderStatusChart();
    this.createTopProductsChart();
    this.createSalesTrendChart();
  }

  createRevenueChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Mock monthly revenue data
    const monthlyRevenue = [
      2500, 3200, 4100, 3800, 4500, 5200, 
      5800, 5400, 6200, 6800, 7500, 8200
    ];

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

    // Mock top products data
    const topProducts = [
      { name: 'Product A', sales: 85 },
      { name: 'Product B', sales: 72 },
      { name: 'Product C', sales: 65 },
      { name: 'Product D', sales: 58 },
      { name: 'Product E', sales: 45 }
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

  createSalesTrendChart(): void {
    const ctx = document.getElementById('salesTrendChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Mock sales trend data
    const salesTrend = [12, 19, 15, 22, 18, 25, 28, 24, 30, 35, 32, 38];

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
