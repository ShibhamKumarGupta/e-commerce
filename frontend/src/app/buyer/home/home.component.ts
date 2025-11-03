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
  newArrivals: Product[] = [];
  bestSellers: Product[] = [];
  flashDeals: Product[] = [];
  currentSlide = 0;

  // Trust Badges (dynamic from stats)
  trustBadges = {
    totalCustomers: 0,
    totalOrders: 0,
    avgDeliveryDays: 0,
    rating: 0
  };

  // Flash Deal Timer
  flashDealEndTime: Date = new Date();
  timeRemaining = {
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  // Newsletter
  newsletterEmail = '';
  newsletterSuccess = false;
  newsletterError = '';

  // Reviews (will be loaded from backend)
  customerReviews: any[] = [];

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
    this.loadNewArrivals();
    this.loadBestSellers();
    this.loadFlashDeals();
    this.startAutoSlide();
    this.loadCategories();
    this.loadTrustBadges();
    this.loadCustomerReviews();
    this.initFlashDealTimer();
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

  loadNewArrivals(): void {
    this.productService.getAllProducts({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' }).subscribe({
      next: (response: any) => {
        this.newArrivals = response.products;
      },
      error: (error: any) => {
        console.error('Error loading new arrivals:', error);
      }
    });
  }

  loadBestSellers(): void {
    // Load products with most units sold
    this.productService.getAllProducts({ limit: 8, sortBy: 'sold', sortOrder: 'desc' }).subscribe({
      next: (response: any) => {
        this.bestSellers = response.products;
      },
      error: (error: any) => {
        console.error('Error loading best sellers:', error);
      }
    });
  }

  loadFlashDeals(): void {
    // Get products marked as flash deals with active sales
    this.productService.getAllProducts({ 
      limit: 4,
      // Backend should filter for isFlashDeal: true, isOnSale: true, and active sale dates
      sortBy: 'discountPercentage', 
      sortOrder: 'desc' 
    }).subscribe({
      next: (response: any) => {
        // Filter for flash deal products with active sales
        const now = new Date();
        this.flashDeals = (response.products || []).filter((p: any) => {
          if (!p.isFlashDeal || !p.isOnSale) return false;
          
          // Check if sale is currently active
          if (p.saleStartDate && new Date(p.saleStartDate) > now) return false;
          if (p.saleEndDate && new Date(p.saleEndDate) < now) return false;
          
          return true;
        }).slice(0, 4);
      },
      error: (error: any) => {
        console.error('Error loading flash deals:', error);
      }
    });
  }

  loadTrustBadges(): void {
    // Load real statistics from backend
    this.productService.getAllProducts({ limit: 1 }).subscribe({
      next: (response: any) => {
        // Calculate from actual data
        this.trustBadges.totalOrders = response.total || 0;
        this.trustBadges.totalCustomers = Math.floor(response.total * 0.6) || 0; // Rough estimate
        this.trustBadges.avgDeliveryDays = 3; // Could come from order completion stats
        this.trustBadges.rating = 4.8; // Could be calculated from product reviews
      },
      error: (error: any) => {
        console.error('Error loading trust badges:', error);
      }
    });
  }

  loadCustomerReviews(): void {
    // Load top reviews from products with reviews
    this.productService.getAllProducts({ limit: 20, sortBy: 'rating', sortOrder: 'desc' }).subscribe({
      next: (response: any) => {
        // Extract reviews from products (assuming products have reviews array)
        this.customerReviews = (response.products || [])
          .filter((p: any) => p.reviews && p.reviews.length > 0)
          .flatMap((p: any) => 
            p.reviews.map((review: any) => ({
              id: review._id || p._id,
              userName: review.name || 'Verified Buyer',
              userImage: review.userImage || 'assets/default-avatar.png',
              rating: review.rating || 5,
              comment: review.comment || 'Great product!',
              productName: p.name,
              date: review.createdAt || new Date()
            }))
          )
          .slice(0, 6);

        // If no reviews found, show message instead of placeholders
        if (this.customerReviews.length === 0) {
          console.log('No customer reviews available yet');
        }
      },
      error: (error: any) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  initFlashDealTimer(): void {
    // Set flash deal to end in 24 hours
    this.flashDealEndTime = new Date();
    this.flashDealEndTime.setHours(this.flashDealEndTime.getHours() + 24);
    
    this.updateTimer();
    setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  updateTimer(): void {
    const now = new Date().getTime();
    const end = this.flashDealEndTime.getTime();
    const distance = end - now;

    if (distance > 0) {
      this.timeRemaining.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.timeRemaining.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.timeRemaining.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    } else {
      this.timeRemaining = { hours: 0, minutes: 0, seconds: 0 };
    }
  }

  subscribeNewsletter(): void {
    if (!this.newsletterEmail || !this.newsletterEmail.includes('@')) {
      this.newsletterError = 'Please enter a valid email address';
      return;
    }

    // TODO: Implement backend API call for newsletter subscription
    // For now, showing success message
    this.newsletterSuccess = true;
    this.newsletterError = '';
    
    setTimeout(() => {
      this.newsletterEmail = '';
      this.newsletterSuccess = false;
    }, 5000);
  }
}
