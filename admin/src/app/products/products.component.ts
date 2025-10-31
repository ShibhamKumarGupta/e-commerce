import { Component, OnInit } from '@angular/core';
import { ProductService } from '../core/services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  loading = false;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  limit = 10;

  // Filters
  selectedCategory = '';
  categories: string[] = [];
  searchQuery = '';
  selectedStatus = '';

  // Selected product for actions
  selectedProduct: any = null;
  showDeleteModal = false;
  showToggleModal = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;

    const query: any = {
      page: this.currentPage,
      limit: this.limit
    };

    if (this.selectedCategory) query.category = this.selectedCategory;
    if (this.searchQuery) query.search = this.searchQuery;

    this.productService.getAllProducts(query).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalProducts = response.total;
        this.totalPages = response.pages;
        this.currentPage = response.page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  openDeleteModal(product: any): void {
    this.selectedProduct = product;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedProduct = null;
  }

  confirmDelete(): void {
    if (this.selectedProduct) {
      this.productService.adminDeleteProduct(this.selectedProduct._id).subscribe({
        next: () => {
          alert('Product deleted successfully');
          this.closeDeleteModal();
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product');
        }
      });
    }
  }

  openToggleModal(product: any): void {
    this.selectedProduct = product;
    this.showToggleModal = true;
  }

  closeToggleModal(): void {
    this.showToggleModal = false;
    this.selectedProduct = null;
  }

  confirmToggleStatus(): void {
    if (this.selectedProduct) {
      const newStatus = !this.selectedProduct.isActive;
      this.productService.adminUpdateProduct(this.selectedProduct._id, { 
        isActive: newStatus 
      }).subscribe({
        next: (updatedProduct) => {
          this.selectedProduct.isActive = newStatus; // Update the local state immediately
          const message = newStatus ? 'Product activated successfully' : 'Product deactivated successfully';
          alert(message);
          this.closeToggleModal();
          // Find and update the product in the list
          const index = this.products.findIndex(p => p._id === this.selectedProduct._id);
          if (index !== -1) {
            this.products[index].isActive = newStatus;
          }
        },
        error: (error) => {
          console.error('Error updating product status:', error);
          alert('Failed to update product status');
        }
      });
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }
}
