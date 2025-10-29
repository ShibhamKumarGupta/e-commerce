import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { BuyerGuard } from './core/guards/buyer.guard';
import { SellerGuard } from './core/guards/seller.guard';
import { RoleRedirectGuard } from './core/guards/role-redirect.guard';

// Auth
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

// Buyer
import { HomeComponent } from './buyer/home/home.component';
import { ProductsComponent } from './buyer/products/products.component';
import { ProductDetailComponent } from './buyer/product-detail/product-detail.component';
import { CartComponent } from './buyer/cart/cart.component';
import { CheckoutComponent } from './buyer/checkout/checkout.component';
import { OrdersComponent } from './buyer/orders/orders.component';
import { OrderDetailComponent } from './buyer/order-detail/order-detail.component';
import { ProfileComponent } from './buyer/profile/profile.component';
import { PaymentSuccessComponent } from './buyer/payment-success/payment-success.component';
import { PaymentCancelComponent } from './buyer/payment-cancel/payment-cancel.component';

// Seller
import { SellerDashboardComponent } from './seller/dashboard/dashboard.component';
import { SellerProductsComponent } from './seller/products/products.component';
import { ProductFormComponent } from './seller/product-form/product-form.component';
import { SellerOrdersComponent } from './seller/orders/orders.component';
import { SellerOrderDetailsComponent } from './seller/order-details/order-details.component';
import { SellerReportsComponent } from './seller/reports/reports.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SellerNotFoundComponent } from './seller/not-found/seller-not-found.component';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [RoleRedirectGuard] },
  
  // Auth Routes
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  
  // Public Routes (with role check to prevent sellers from accessing)
  { path: 'products', component: ProductsComponent, canActivate: [RoleRedirectGuard] },
  { path: 'products/:id', component: ProductDetailComponent, canActivate: [RoleRedirectGuard] },
  
  // Buyer Routes (Protected - Only Buyers)
  {
    path: 'buyer',
    canActivate: [BuyerGuard],
    children: [
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'orders/:id', component: OrderDetailComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'payment-success', component: PaymentSuccessComponent },
      { path: 'payment-cancel', component: PaymentCancelComponent }
    ]
  },
  
  // Seller Routes (Protected - Only Sellers)
  {
    path: 'seller',
    canActivate: [SellerGuard],
    children: [
      { path: 'dashboard', component: SellerDashboardComponent },
      { path: 'products', component: SellerProductsComponent },
      { path: 'products/add', component: ProductFormComponent },
      { path: 'products/edit/:id', component: ProductFormComponent },
      { path: 'orders', component: SellerOrdersComponent },
      { path: 'orders/:id', component: SellerOrderDetailsComponent },
      { path: 'reports', component: SellerReportsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'not-found', component: SellerNotFoundComponent },
      // Seller 404 - for any unmatched seller routes
      { path: '**', component: SellerNotFoundComponent }
    ]
  },
  
  // Explicit 404 route
  { path: '404', component: NotFoundComponent },
  
  // General 404 Not Found - Must be last
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 0]
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
