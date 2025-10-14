import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface UserQuery {
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getAllUsers(query?: UserQuery): Observable<any> {
    return this.apiService.get<any>('/users', query).pipe(
      map(response => response.data)
    );
  }

  getUserById(id: string): Observable<any> {
    return this.apiService.get<any>(`/users/${id}`).pipe(
      map(response => response.data.user)
    );
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.apiService.put<any>(`/users/${id}`, data).pipe(
      map(response => response.data.user)
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.apiService.delete<any>(`/users/${id}`);
  }

  toggleUserStatus(id: string): Observable<any> {
    return this.apiService.patch<any>(`/users/${id}/toggle-status`, {}).pipe(
      map(response => response.data.user)
    );
  }

  getUserStats(): Observable<any> {
    return this.apiService.get<any>('/users/stats').pipe(
      map(response => response.data)
    );
  }
}
