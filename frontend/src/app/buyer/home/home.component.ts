import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
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

  categories: Array<{name: string, icon: string, category: string}> = [];

  icons: { [key: string]: string } = {
    'electronics': '💻',
    'fashion': '👕',
    'home': '🏠',
    'books': '📚',
    'sports': '⚽',
    'beauty': '💄',
    'toys': '🧸',
    'groceries': '🛒',
    'furniture': '🪑',
    'health': '💊',
    'automotive': '🚗',
    'garden': '🌺',
    'jewelry': '💍',
    'art': '🎨'
  }
  

  heroSlides = [
    {
      title: 'Unbeatable Tech Deals',
      subtitle: 'Discover our latest collection of gadgets and save big. Limited time only!',
      buttonText: 'Shop Now',
      buttonLink: '/products?category=electronics',
      background: 'url("https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1920") center/cover no-repeat'
    },
    {
      title: 'Fashion Forward',
      subtitle: 'Elevate your style with our trending fashion collection',
      buttonText: 'Explore',
      buttonLink: '/products?category=fashion',
      background: 'url("https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1920") center/cover no-repeat'
    },
    {
      title: 'Home Essentials',
      subtitle: 'Transform your living space with our curated home collection',
      buttonText: 'Discover',
      buttonLink: '/products?category=home-kitchen',
      background: 'url("https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=1920") center/cover no-repeat'
    }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadTrendingProducts();
    this.startAutoSlide();
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.map(category => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          icon: this.icons[category.toLowerCase()] || '🏷️',
          category: category
        }));
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
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

  navigateToCategory(category: string): void {
    this.router.navigate(['/products'], { queryParams: { category } });
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  addToCart(product: Product): void {
    if (product.stock > 0) {
      this.cartService.addToCart(product, 1);
    }
  }
}
