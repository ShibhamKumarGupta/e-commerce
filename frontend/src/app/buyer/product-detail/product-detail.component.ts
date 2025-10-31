import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  selectedImage = 0;
  quantity = 1;
  similarProducts: Product[] = [];
  showZoomPreview = false;
  showImageModal = false;
  zoomPosition = { x: 0, y: 0 };
  zoomScale = 2.5; // How much to zoom in
  
  // Review form
  showReviewForm = false;
  rating = 5;
  comment = '';
  submittingReview = false;
  reviewEligibility = { canReview: false, hasReviewed: false, hasPurchased: false };
  checkingEligibility = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProductById(id)
      .pipe(
        switchMap(product => {
          this.product = product;
          // Check review eligibility if user is authenticated
          if (this.authService.isAuthenticated) {
            this.checkReviewEligibility(id);
          }
          // Fetch similar products by category, excluding current product
          return this.productService.getAllProducts({ 
            category: product.category,
            limit: 4,
            page: 1
          });
        })
      )
      .subscribe({
        next: (response) => {
          this.similarProducts = response.products.filter(p => p._id !== this.product?._id);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.loading = false;
          alert('Failed to load product');
          this.router.navigate(['/products']);
        }
      });
  }

  checkReviewEligibility(productId: string): void {
    this.checkingEligibility = true;
    this.productService.checkReviewEligibility(productId).subscribe({
      next: (eligibility) => {
        this.reviewEligibility = eligibility;
        this.checkingEligibility = false;
      },
      error: (error) => {
        console.error('Error checking review eligibility:', error);
        this.checkingEligibility = false;
      }
    });
  }

  selectImage(index: number): void {
    this.selectedImage = index;
  }

  openImageModal(): void {
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
  }

  prevImage(): void {
    if (this.product && this.product.images.length > 1) {
      this.selectedImage = this.selectedImage > 0 ? this.selectedImage - 1 : this.product.images.length - 1;
    }
  }

  nextImage(): void {
    if (this.product && this.product.images.length > 1) {
      this.selectedImage = this.selectedImage < this.product.images.length - 1 ? this.selectedImage + 1 : 0;
    }
  }

  onImageMouseMove(event: MouseEvent): void {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Constrain the position to stay within bounds
    this.zoomPosition.x = Math.max(0, Math.min(100, x));
    this.zoomPosition.y = Math.max(0, Math.min(100, y));
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      // Toast notification will be handled by CartService
    }
  }

  buyNow(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      this.router.navigate(['/buyer/cart']);
    }
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  submitReview(): void {
    if (!this.product || !this.comment.trim()) {
      return;
    }

    // Double-check eligibility before submitting
    if (!this.reviewEligibility.canReview) {
      alert('You are not eligible to review this product.');
      return;
    }

    this.submittingReview = true;
    this.productService.addReview(this.product._id, this.rating, this.comment).subscribe({
      next: () => {
        this.showReviewForm = false;
        this.comment = '';
        this.rating = 5;
        this.loadProduct(this.product!._id);
        this.submittingReview = false;
      },
      error: (error) => {
        this.submittingReview = false;
        // Refresh eligibility in case it changed
        if (this.authService.isAuthenticated) {
          this.checkReviewEligibility(this.product!._id);
        }
      }
    });
  }

  getStarPercentage(stars: number): number {
    if (!this.product || this.product.numReviews === 0) return 0;
    const count = this.product.reviews.filter(r => Math.floor(r.rating) === stars).length;
    return Math.round((count / this.product.numReviews) * 100);
  }
}
