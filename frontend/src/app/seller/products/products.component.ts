import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-seller-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class SellerProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    // Use seller-specific endpoint to only load seller's own products
    this.productService.getSellerProducts({ page: this.currentPage, limit: 10 }).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalPages = response.pages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  editProduct(id: string): void {
    this.router.navigate(['/seller/products/edit', id]);
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          alert('Product deleted successfully');
          this.loadProducts();
        },
        error: (error) => {
          alert(error.message || 'Failed to delete product');
        }
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }
}
