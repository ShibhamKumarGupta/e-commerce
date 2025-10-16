import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { SubOrderService } from '../../core/services/sub-order.service';

@Component({
  selector: 'app-seller-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class SellerDashboardComponent implements OnInit {
  loading = false;
  stats = {
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalEarnings: 0,
    totalCommission: 0
  };
  recentOrders: any[] = [];

  constructor(
    private productService: ProductService,
    private subOrderService: SubOrderService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load seller-specific product stats
    this.productService.getSellerProductStats().subscribe({
      next: (stats) => {
        this.stats.totalProducts = stats.totalProducts;
        this.stats.activeProducts = stats.activeProducts;
      }
    });

    // Load seller-specific order stats and earnings
    this.subOrderService.getSellerStats().subscribe({
      next: (stats) => {
        this.stats.totalOrders = stats.totalSubOrders;
        this.stats.pendingOrders = stats.pendingOrders;
        this.stats.totalEarnings = stats.totalEarnings || 0;
        this.stats.totalCommission = stats.totalCommission || 0;
      }
    });

    // Load recent sub-orders
    this.subOrderService.getSellerSubOrders(1, 5).subscribe({
      next: (response) => {
        this.recentOrders = response.subOrders;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
