import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProductCategory } from '../../core/services/product.service';

interface CategoryPalette {
  background: string;
  glow: string;
  accent: string;
  text: string;
  mutedText: string;
  iconBg: string;
  iconBorder: string;
  iconShadow: string;
  badgeBg: string;
}

interface DisplayCategory {
  name: string;
  slug: string;
  iconSvg?: string;
  iconSafeHtml?: SafeHtml | null;
  palette: CategoryPalette;
}

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

  categories: DisplayCategory[] = [];
  private readonly categoryPalettes: CategoryPalette[] = [
    {
      background: 'linear-gradient(135deg, #fde68a 0%, #fca5a5 100%)',
      glow: 'rgba(249, 168, 212, 0.45)',
      accent: '#ea580c',
      text: '#0f172a',
      mutedText: 'rgba(15, 23, 42, 0.62)',
      iconBg: 'rgba(255, 255, 255, 0.82)',
      iconBorder: 'rgba(234, 88, 12, 0.28)',
      iconShadow: '0 18px 30px -16px rgba(234, 88, 12, 0.55)',
      badgeBg: 'rgba(255, 255, 255, 0.34)'
    },
    {
      background: 'linear-gradient(135deg, #bfdbfe 0%, #c4b5fd 100%)',
      glow: 'rgba(129, 140, 248, 0.45)',
      accent: '#4338ca',
      text: '#0f172a',
      mutedText: 'rgba(30, 41, 59, 0.6)',
      iconBg: 'rgba(255, 255, 255, 0.84)',
      iconBorder: 'rgba(67, 56, 202, 0.28)',
      iconShadow: '0 18px 30px -16px rgba(67, 56, 202, 0.55)',
      badgeBg: 'rgba(255, 255, 255, 0.32)'
    },
    {
      background: 'linear-gradient(135deg, #bbf7d0 0%, #6ee7b7 100%)',
      glow: 'rgba(34, 197, 94, 0.45)',
      accent: '#047857',
      text: '#0f172a',
      mutedText: 'rgba(15, 118, 110, 0.55)',
      iconBg: 'rgba(255, 255, 255, 0.85)',
      iconBorder: 'rgba(4, 120, 87, 0.28)',
      iconShadow: '0 18px 30px -16px rgba(4, 120, 87, 0.55)',
      badgeBg: 'rgba(255, 255, 255, 0.32)'
    },
    {
      background: 'linear-gradient(135deg, #fecdd3 0%, #f9a8d4 45%, #f0abfc 100%)',
      glow: 'rgba(236, 72, 153, 0.45)',
      accent: '#db2777',
      text: '#0f172a',
      mutedText: 'rgba(190, 24, 93, 0.55)',
      iconBg: 'rgba(255, 255, 255, 0.8)',
      iconBorder: 'rgba(219, 39, 119, 0.28)',
      iconShadow: '0 18px 30px -16px rgba(219, 39, 119, 0.55)',
      badgeBg: 'rgba(255, 255, 255, 0.3)'
    },
    {
      background: 'linear-gradient(135deg, #bae6fd 0%, #a7f3d0 100%)',
      glow: 'rgba(59, 130, 246, 0.35)',
      accent: '#0369a1',
      text: '#0f172a',
      mutedText: 'rgba(3, 105, 161, 0.6)',
      iconBg: 'rgba(255, 255, 255, 0.82)',
      iconBorder: 'rgba(3, 105, 161, 0.26)',
      iconShadow: '0 18px 30px -16px rgba(3, 105, 161, 0.5)',
      badgeBg: 'rgba(255, 255, 255, 0.33)'
    },
    {
      background: 'linear-gradient(135deg, #fbcfe8 0%, #fde68a 50%, #fcd34d 100%)',
      glow: 'rgba(251, 191, 36, 0.4)',
      accent: '#b45309',
      text: '#78350f',
      mutedText: 'rgba(146, 64, 14, 0.62)',
      iconBg: 'rgba(255, 255, 255, 0.86)',
      iconBorder: 'rgba(180, 83, 9, 0.26)',
      iconShadow: '0 18px 30px -16px rgba(180, 83, 9, 0.5)',
      badgeBg: 'rgba(255, 255, 255, 0.35)'
    }
  ];
  

  heroSlides = [
    {
      title: 'Unbeatable Tech Deals',
      subtitle: 'Discover our latest collection of gadgets and save big. Limited time only!',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      queryParams: { category: 'electronics' },
      background: 'url("https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1920") center/cover no-repeat'
    },
    {
      title: 'Fashion Forward',
      subtitle: 'Elevate your style with our trending fashion collection',
      buttonText: 'Explore',
      buttonLink: '/products',
      queryParams: { category: 'fashion' },
      background: 'url("https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1920") center/cover no-repeat'
    },
    {
      title: 'Sports & Outdoors',
      subtitle: 'Gear up for adventure with our premium sports collection',
      buttonText: 'Discover',
      buttonLink: '/products',
      queryParams: { category: 'sports' },
      background: 'url("https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1920") center/cover no-repeat'
    }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadTrendingProducts();
    this.startAutoSlide();
    this.loadCategories();
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories: ProductCategory[]) => {
        this.categories = categories.map((category, index) => {
          const palette = this.categoryPalettes[index % this.categoryPalettes.length];

          return {
          name: category.name,
          slug: category.slug,
          iconSvg: category.iconSvg,
          iconSafeHtml: category.iconSvg ? this.sanitizer.bypassSecurityTrustHtml(category.iconSvg) : null,
          palette
        };
        });
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
    this.productService.getAllProducts({ limit: 4, sortBy: 'rating', sortOrder: 'desc' }).subscribe({
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

  navigateToCategory(categorySlug: string): void {
    this.router.navigate(['/products'], { queryParams: { category: categorySlug } });
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
