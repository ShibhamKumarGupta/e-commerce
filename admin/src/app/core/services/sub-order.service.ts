import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SubOrderService {
  constructor(private apiService: ApiService) {}

  getAllSubOrders(params?: any): Observable<any> {
    return this.apiService.get<any>('/sub-orders/admin/all', params).pipe(
      map(response => response.data)
    );
  }

  getSubOrderById(id: string): Observable<any> {
    return this.apiService.get<any>(`/sub-orders/${id}`).pipe(
      map(response => response.data.subOrder)
    );
  }

  getCommissionBreakdown(startDate?: string, endDate?: string): Observable<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return this.apiService.get<any>('/sub-orders/admin/commission-breakdown', params).pipe(
      map(response => response.data)
    );
  }

  updateSubOrderStatus(id: string, status: string): Observable<any> {
    return this.apiService.patch<any>(`/sub-orders/${id}/status`, { status }).pipe(
      map(response => response.data.subOrder)
    );
  }
}
