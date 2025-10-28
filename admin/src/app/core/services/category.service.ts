import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private apiService: ApiService) {}

  getAllCategories(params?: any): Observable<{ categories: Category[]; total: number }> {
    return this.apiService.get<any>('/categories', params).pipe(
      map(response => response.data)
    );
  }

  getCategoryById(id: string): Observable<Category> {
    return this.apiService.get<any>(`/categories/${id}`).pipe(
      map(response => response.data.category)
    );
  }

  createCategory(data: Partial<Category>): Observable<Category> {
    return this.apiService.post<any>('/categories', data).pipe(
      map(response => response.data.category)
    );
  }

  updateCategory(id: string, data: Partial<Category>): Observable<Category> {
    return this.apiService.put<any>(`/categories/${id}`, data).pipe(
      map(response => response.data.category)
    );
  }

  deleteCategory(id: string): Observable<any> {
    return this.apiService.delete<any>(`/categories/${id}`).pipe(
      map(response => response.data)
    );
  }

  toggleCategoryStatus(id: string): Observable<Category> {
    return this.apiService.patch<any>(`/categories/${id}/toggle-status`, {}).pipe(
      map(response => response.data.category)
    );
  }
}
