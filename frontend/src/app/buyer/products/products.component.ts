import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductService, ProductCategory } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, ProductQuery } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Array<ProductCategory & { iconSafeHtml?: SafeHtml | null }> = [];
  loading = false;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  limit = 12;

  // Filters
  selectedCategories: string[] = [];
  minPrice: number | undefined;
  maxPrice: number | undefined;
  minRating: number | undefined;
  searchQuery = '';
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  showFilters = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    // Read query params from URL
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      if (params['category']) {
        // category query can be single slug or multiple joined by +
        this.selectedCategories = String(params['category']).split('+').filter(Boolean);
      } else {
        this.selectedCategories = [];
      }
      this.loadProducts();
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.map(category => ({
          ...category,
          iconSafeHtml: category.iconSvg ? this.sanitizer.bypassSecurityTrustHtml(category.iconSvg) : null
        }));
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadProducts(): void {
    this.loading = true;

    const query: ProductQuery = {
      page: this.currentPage,
      limit: this.limit,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    if (this.selectedCategories && this.selectedCategories.length) query.category = this.selectedCategories.join('+');
    if (this.minPrice !== undefined) query.minPrice = this.minPrice;
    if (this.maxPrice !== undefined) query.maxPrice = this.maxPrice;
    if (this.minRating !== undefined) query.minRating = this.minRating;
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
    // Keep for compatibility if template calls it without args
    this.currentPage = 1;
    this.updateUrlAndLoad();
  }

  toggleCategory(slug: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedCategories.includes(slug)) this.selectedCategories.push(slug);
    } else {
      this.selectedCategories = this.selectedCategories.filter(s => s !== slug);
    }
    this.currentPage = 1;
    this.updateUrlAndLoad();
  }

  clearCategorySelection(): void {
    this.selectedCategories = [];
    this.currentPage = 1;
    this.updateUrlAndLoad();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  private updateUrlAndLoad(): void {
    // Build query params to reflect current filters (no hardcoding)
    const params: any = {};
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.selectedCategories && this.selectedCategories.length) params.category = this.selectedCategories.join('+');
    if (this.minPrice !== undefined) params.minPrice = this.minPrice;
    if (this.maxPrice !== undefined) params.maxPrice = this.maxPrice;
    if (this.minRating !== undefined) params.minRating = this.minRating;
    params.page = this.currentPage;

    // Update URL without navigating away
    this.router.navigate([], { relativeTo: this.route, queryParams: params, replaceUrl: true });
    this.loadProducts();
  }

  onSortChange(): void {
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToCart(product: Product): void {
    if (product.stock === 0) {
      this.toastService.error('This product is out of stock');
      return;
    }
    
    this.cartService.addToCart(product, 1);
    // Toast is already shown by CartService
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.minRating = undefined;
    this.searchQuery = '';
    this.currentPage = 1;
    this.updateUrlAndLoad();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
