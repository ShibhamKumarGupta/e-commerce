import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SubOrderService {
  constructor(private apiService: ApiService) {}

  getSubOrderById(id: string): Observable<any> {
    return this.apiService.get<any>(`/sub-orders/${id}`).pipe(
      map(response => response.data.subOrder)
    );
  }

  getSellerSubOrders(page: number = 1, limit: number = 10, status?: string, paymentStatus?: string): Observable<any> {
    const params: any = { page, limit };
    if (status) params.status = status;
    if (paymentStatus) params.paymentStatus = paymentStatus;
    
    return this.apiService.get<any>('/sub-orders/seller/my-orders', params).pipe(
      map(response => response.data)
    );
  }

  updateSubOrderStatus(id: string, status: string): Observable<any> {
    return this.apiService.patch<any>(`/sub-orders/${id}/status`, { status }).pipe(
      map(response => response.data.subOrder)
    );
  }

  getSellerEarnings(startDate?: string, endDate?: string): Observable<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return this.apiService.get<any>('/sub-orders/seller/earnings', params).pipe(
      map(response => response.data)
    );
  }

  getSellerStats(): Observable<any> {
    return this.apiService.get<any>('/sub-orders/seller/stats').pipe(
      map(response => response.data)
    );
  }
}
