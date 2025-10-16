import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();

  constructor(private toastService: ToastService) {}

  private getInitialCart(): Cart {
    const cartStr = localStorage.getItem('cart');
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
    localStorage.setItem('cart', JSON.stringify(cart));
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
    this.saveCart(emptyCart);
  }

  get cart(): Cart {
    return this.cartSubject.value;
  }

  get itemCount(): number {
    return this.cartSubject.value.totalItems;
  }
}
