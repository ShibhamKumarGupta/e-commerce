import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Order, CreateOrderRequest } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private apiService: ApiService) {}

  createOrder(data: CreateOrderRequest): Observable<Order> {
    return this.apiService.post<any>('/orders', data).pipe(
      map(response => response.data.order)
    );
  }

  getMyOrders(page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get<any>('/orders/my-orders', { page, limit }).pipe(
      map(response => response.data)
    );
  }

  getOrderById(id: string): Observable<Order> {
    return this.apiService.get<any>(`/orders/${id}`).pipe(
      map(response => response.data.order)
    );
  }

  cancelOrder(id: string): Observable<Order> {
    return this.apiService.patch<any>(`/orders/${id}/cancel`, {}).pipe(
      map(response => response.data.order)
    );
  }

  updatePaymentStatus(id: string, paymentStatus: string, paymentResult?: any): Observable<Order> {
    return this.apiService.patch<any>(`/orders/${id}/payment`, {
      paymentStatus,
      paymentResult
    }).pipe(
      map(response => response.data.order)
    );
  }

  getAllOrders(query?: any): Observable<any> {
    return this.apiService.get<any>('/orders/admin/all', query).pipe(
      map(response => response.data)
    );
  }

  getOrderStats(): Observable<any> {
    return this.apiService.get<any>('/orders/admin/stats').pipe(
      map(response => response.data)
    );
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.apiService.patch<any>(`/orders/${id}/status`, { status }).pipe(
      map(response => response.data.order)
    );
  }

  getMonthlyRevenue(year?: number): Observable<any[]> {
    const params = year ? { year } : {};
    return this.apiService.get<any>('/orders/admin/analytics/monthly-revenue', params).pipe(
      map(response => response.data.monthlyRevenue)
    );
  }

  getTopProducts(limit: number = 5): Observable<any[]> {
    return this.apiService.get<any>('/orders/admin/analytics/top-products', { limit }).pipe(
      map(response => response.data.topProducts)
    );
  }
}
