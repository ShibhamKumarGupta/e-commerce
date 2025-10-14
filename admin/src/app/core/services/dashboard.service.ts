import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { ProductService } from './product.service';
import { OrderService } from './order.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  getDashboardStats(): Observable<any> {
    return forkJoin({
      userStats: this.userService.getUserStats(),
      productStats: this.productService.getProductStats(),
      orderStats: this.orderService.getOrderStats()
    }).pipe(
      map(({ userStats, productStats, orderStats }) => ({
        users: userStats,
        products: productStats,
        orders: orderStats
      }))
    );
  }

  getRecentOrders(limit: number = 10): Observable<any> {
    return this.orderService.getAllOrders({ page: 1, limit }).pipe(
      map((response: any) => response.orders)
    );
  }

  getRevenueData(period: string = 'month'): Observable<any> {
    return this.apiService.get<any>(`/orders/admin/revenue?period=${period}`).pipe(
      map(response => response.data)
    );
  }
}
