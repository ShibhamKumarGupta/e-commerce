import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product, ProductQuery, ProductResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private apiService: ApiService) {}

  getAllProducts(query?: ProductQuery): Observable<ProductResponse> {
    return this.apiService.get<any>('/products', query).pipe(
      map(response => response.data)
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.apiService.get<any>(`/products/${id}`).pipe(
      map(response => response.data.product)
    );
  }

  getCategories(): Observable<string[]> {
    return this.apiService.get<any>('/products/categories').pipe(
      map(response => response.data.categories)
    );
  }

  addReview(productId: string, rating: number, comment: string): Observable<any> {
    return this.apiService.post<any>(`/products/${productId}/reviews`, {
      rating,
      comment
    });
  }

  createProduct(data: any): Observable<Product> {
    return this.apiService.post<any>('/products', data).pipe(
      map(response => response.data.product)
    );
  }

  updateProduct(id: string, data: any): Observable<Product> {
    return this.apiService.put<any>(`/products/${id}`, data).pipe(
      map(response => response.data.product)
    );
  }

  deleteProduct(id: string): Observable<any> {
    return this.apiService.delete<any>(`/products/${id}`);
  }

  // Seller-specific methods
  getSellerProducts(query?: ProductQuery): Observable<ProductResponse> {
    return this.apiService.get<any>('/products/seller/my-products', query).pipe(
      map(response => response.data)
    );
  }

  getSellerProductStats(): Observable<any> {
    return this.apiService.get<any>('/products/seller/stats').pipe(
      map(response => response.data)
    );
  }
}
