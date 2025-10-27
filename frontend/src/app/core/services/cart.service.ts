import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();

  constructor(
    private toastService: ToastService,
    private authService: AuthService
  ) {
    // Handle cart on user state changes
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        // On logout, just clear the cart
        this.clearCart();
      } else {
        // On login/register
        const guestCartKey = 'cart_guest';
        const guestCartStr = sessionStorage.getItem(guestCartKey);
        
        if (guestCartStr) {
          try {
            // Get guest cart
            const guestCart = JSON.parse(guestCartStr);
            // Get user cart
            const userCart = this.getInitialCart();
            // Merge carts
            const mergedCart = this.mergeGuestCartWithUserCart(guestCart, userCart);
            // Save merged cart
            this.saveCart(mergedCart);
            // Remove guest cart
            sessionStorage.removeItem(guestCartKey);
            
            if (guestCart.items.length > 0) {
              this.toastService.success('Your cart items have been saved to your account');
            }
          } catch (error) {
            console.error('Error merging carts', error);
          }
        } else {
          // No guest cart, just load user cart
          this.cartSubject.next(this.getInitialCart());
        }
      }
    });
  }

  private getCurrentUserId(): string | null {
    const user = this.authService.currentUser;
    return user ? user._id : null;
  }

  private getCartKey(): string {
    const userId = this.getCurrentUserId();
    return userId ? `cart_${userId}` : 'cart_guest';
  }

  private mergeGuestCartWithUserCart(guestCart: Cart, userCart: Cart): Cart {
    const mergedCart = { ...userCart };
    
    // Merge items from guest cart into user cart
    guestCart.items.forEach(guestItem => {
      const existingItem = mergedCart.items.find(item => item.product._id === guestItem.product._id);
      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        mergedCart.items.push({ ...guestItem });
      }
    });

    // Recalculate totals
    const totals = this.calculateTotals(mergedCart.items);
    mergedCart.totalItems = totals.totalItems;
    mergedCart.totalPrice = totals.totalPrice;

    return mergedCart;
  }

  private getInitialCart(): Cart {
    const cartStr = sessionStorage.getItem(this.getCartKey());
    if (cartStr) {
      try {
        return JSON.parse(cartStr);
      } catch (error) {
        console.error('Error parsing cart from storage', error);
      }
    }
    return { items: [], totalItems: 0, totalPrice: 0 };
  }

  private saveCart(cart: Cart): void {
    sessionStorage.setItem(this.getCartKey(), JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  private calculateTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    return { totalItems, totalPrice };
  }

  addToCart(product: Product, quantity: number = 1): void {
    const cart = this.cartSubject.value;
    const existingItem = cart.items.find(item => item.product._id === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
      this.toastService.success(`Updated ${product.name} quantity in cart`);
    } else {
      cart.items.push({ product, quantity });
      this.toastService.success(`${product.name} added to cart`);
    }

    const totals = this.calculateTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalPrice = totals.totalPrice;

    this.saveCart(cart);
  }

  removeFromCart(productId: string): void {
    const cart = this.cartSubject.value;
    cart.items = cart.items.filter(item => item.product._id !== productId);

    const totals = this.calculateTotals(cart.items);
    cart.totalItems = totals.totalItems;
    cart.totalPrice = totals.totalPrice;

    this.saveCart(cart);
  }

  updateQuantity(productId: string, quantity: number): void {
    const cart = this.cartSubject.value;
    const item = cart.items.find(item => item.product._id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        const totals = this.calculateTotals(cart.items);
        cart.totalItems = totals.totalItems;
        cart.totalPrice = totals.totalPrice;
        this.saveCart(cart);
      }
    }
  }

  clearCart(): void {
    const emptyCart: Cart = { items: [], totalItems: 0, totalPrice: 0 };
    sessionStorage.removeItem(this.getCartKey());
    this.cartSubject.next(emptyCart);
  }

  get cart(): Cart {
    return this.cartSubject.value;
  }

  get itemCount(): number {
    return this.cartSubject.value.totalItems;
  }
}
