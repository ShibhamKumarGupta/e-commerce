import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

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

const routes: Routes = [
  { path: '', component: HomeComponent },
  
  // Auth Routes
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  
  // Public Routes
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  
  // Buyer Routes (Protected)
  {
    path: 'buyer',
    canActivate: [AuthGuard],
    children: [
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'payment-success', component: PaymentSuccessComponent },
      { path: 'payment-cancel', component: PaymentCancelComponent }
    ]
  },
  
  // Seller Routes (Protected)
  {
    path: 'seller',
    canActivate: [AuthGuard],
    data: { role: 'seller' },
    children: [
      { path: 'dashboard', component: SellerDashboardComponent },
      { path: 'products', component: SellerProductsComponent },
      { path: 'products/add', component: ProductFormComponent },
      { path: 'products/edit/:id', component: ProductFormComponent },
      { path: 'orders', component: SellerOrdersComponent },
      { path: 'orders/:id', component: SellerOrderDetailsComponent },
      { path: 'reports', component: SellerReportsComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  
  // Fallback
  { path: '**', redirectTo: '/products' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
