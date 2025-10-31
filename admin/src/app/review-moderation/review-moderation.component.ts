import { Component, OnInit } from '@angular/core';
import { ProductService } from '../core/services/product.service';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-review-moderation',
  templateUrl: './review-moderation.component.html',
  styleUrls: ['./review-moderation.component.css']
})
export class ReviewModerationComponent implements OnInit {
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

  // Selected product for reviews
  selectedProduct: any = null;
  showReviewsModal = false;

  // Selected review for deletion
  selectedReview: any = null;
  showDeleteReviewModal = false;

  constructor(
    private productService: ProductService,
    private userService: UserService
  ) {}

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

    this.productService.adminGetAllProducts(query).subscribe({
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
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  showReviews(product: any): void {
    this.selectedProduct = product;
    this.showReviewsModal = true;
  }

  closeReviewsModal(): void {
    this.showReviewsModal = false;
    this.selectedProduct = null;
  }

  openDeleteReviewModal(review: any, reviewIndex: number): void {
    this.selectedReview = { ...review, index: reviewIndex };
    this.showDeleteReviewModal = true;
  }

  closeDeleteReviewModal(): void {
    this.showDeleteReviewModal = false;
    this.selectedReview = null;
  }

  confirmDeleteReview(): void {
    if (this.selectedReview && this.selectedProduct) {
      this.productService.adminDeleteReview(this.selectedProduct._id, this.selectedReview.index).subscribe({
        next: () => {
          alert('Review deleted successfully');
          this.closeDeleteReviewModal();
          // Update the product's reviews locally
          this.selectedProduct.reviews.splice(this.selectedReview.index, 1);
          // Recalculate rating
          const totalRating = this.selectedProduct.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
          this.selectedProduct.numReviews = this.selectedProduct.reviews.length;
          this.selectedProduct.rating = this.selectedProduct.numReviews > 0 ? totalRating / this.selectedProduct.numReviews : 0;
          // Reload products to reflect changes
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting review:', error);
          alert('Failed to delete review');
        }
      });
    }
  }

  deactivateUser(userId: string): void {
    if (confirm('Are you sure you want to deactivate this user?')) {
      this.userService.toggleUserStatus(userId).subscribe({
        next: () => {
          alert('User deactivated successfully');
          // Reload products to reflect user status changes
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deactivating user:', error);
          alert('Failed to deactivate user');
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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}