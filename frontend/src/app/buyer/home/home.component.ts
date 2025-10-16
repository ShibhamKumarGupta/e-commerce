import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  loading = false;
  featuredProducts: Product[] = [];
  trendingProducts: Product[] = [];
  currentSlide = 0;

  categories = [
    { name: 'Electronics', icon: '📱', route: '/products?category=electronics' },
    { name: 'Fashion', icon: '👕', route: '/products?category=fashion' },
    { name: 'Home & Kitchen', icon: '🏠', route: '/products?category=home-kitchen' },
    { name: 'Books', icon: '📚', route: '/products?category=books' },
    { name: 'Sports', icon: '⚽', route: '/products?category=sports' },
    { name: 'Beauty', icon: '💄', route: '/products?category=beauty' },
    { name: 'Toys', icon: '🧸', route: '/products?category=toys' },
    { name: 'Groceries', icon: '🛒', route: '/products?category=groceries' }
  ];

  heroSlides = [
    {
      title: 'Unbeatable Tech Deals',
      subtitle: 'Discover our latest collection of gadgets and save big. Limited time only!',
      buttonText: 'Shop Now',
      buttonLink: '/products?category=electronics',
      background: 'linear-gradient(135deg, #f5d6b3 0%, #e8c39e 100%)'
    },
    {
      title: 'Fashion Forward',
      subtitle: 'Elevate your style with our trending fashion collection',
      buttonText: 'Explore',
      buttonLink: '/products?category=fashion',
      background: 'linear-gradient(135deg, #ffd6e7 0%, #ffb3d9 100%)'
    },
    {
      title: 'Home Essentials',
      subtitle: 'Transform your living space with our curated home collection',
      buttonText: 'Discover',
      buttonLink: '/products?category=home-kitchen',
      background: 'linear-gradient(135deg, #c3e6cb 0%, #a8d5ba 100%)'
    }
  ];

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadTrendingProducts();
    this.startAutoSlide();
  }

  loadFeaturedProducts(): void {
    this.loading = true;
    this.productService.getAllProducts({ limit: 4, sortBy: 'rating', sortOrder: 'desc' }).subscribe({
      next: (response: any) => {
        this.featuredProducts = response.products;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading featured products:', error);
        this.loading = false;
      }
    });
  }

  loadTrendingProducts(): void {
    this.productService.getAllProducts({ limit: 4, sortBy: 'createdAt', sortOrder: 'desc' }).subscribe({
      next: (response: any) => {
        this.trendingProducts = response.products;
      },
      error: (error: any) => {
        console.error('Error loading trending products:', error);
      }
    });
  }

  startAutoSlide(): void {
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.heroSlides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  navigateToCategory(route: string): void {
    this.router.navigateByUrl(route);
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }
}
