import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';

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
    totalRevenue: 0
  };
  recentOrders: any[] = [];

  constructor(
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load seller products
    this.productService.getAllProducts({ limit: 100 }).subscribe({
      next: (response) => {
        this.stats.totalProducts = response.total;
        this.stats.activeProducts = response.products.filter(p => p.isActive).length;
      }
    });

    // Load seller orders
    this.orderService.getMyOrders(1, 5).subscribe({
      next: (response) => {
        this.recentOrders = response.orders;
        this.stats.totalOrders = response.total;
        this.stats.pendingOrders = response.orders.filter((o: any) => o.orderStatus === 'pending').length;
        this.stats.totalRevenue = response.orders
          .filter((o: any) => o.paymentStatus === 'paid')
          .reduce((sum: number, o: any) => sum + o.totalPrice, 0);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
