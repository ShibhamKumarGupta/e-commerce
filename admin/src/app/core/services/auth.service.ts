import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User, AuthResponse, LoginRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage', error);
      }
    }
  }

  login(data: LoginRequest): Observable<any> {
    return this.apiService.post<any>('/auth/login', data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuth(response.data);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<any> {
    return this.apiService.get<any>('/auth/profile').pipe(
      tap(response => {
        if (response.success && response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  updateProfile(data: Partial<User>): Observable<any> {
    return this.apiService.put<any>('/auth/profile', data).pipe(
      tap(response => {
        if (response.success && response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.apiService.put<any>('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  private setAuth(data: AuthResponse): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    this.currentUserSubject.next(data.user);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value && !!localStorage.getItem('token');
  }

  get userRole(): string | null {
    return this.currentUser?.role || null;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get isOrderManager(): boolean {
    return this.currentUser?.role === 'order-manager';
  }

  get isAdminOrOrderManager(): boolean {
    return this.isAdmin || this.isOrderManager;
  }
}
