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
  iconSvg?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private apiService: ApiService) {}

  getActiveCategories(): Observable<Category[]> {
    return this.apiService.get<any>('/categories/active').pipe(
      map(response => response.data.categories)
    );
  }

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
}
