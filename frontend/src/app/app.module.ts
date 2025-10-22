import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { ProductsComponent } from './buyer/products/products.component';
import { ProductDetailComponent } from './buyer/product-detail/product-detail.component';
import { CartComponent } from './buyer/cart/cart.component';
import { CheckoutComponent } from './buyer/checkout/checkout.component';
import { OrdersComponent } from './buyer/orders/orders.component';
import { OrderDetailComponent } from './buyer/order-detail/order-detail.component';
import { ProfileComponent } from './buyer/profile/profile.component';
import { PaymentSuccessComponent } from './buyer/payment-success/payment-success.component';
import { PaymentCancelComponent } from './buyer/payment-cancel/payment-cancel.component';

import { SellerDashboardComponent } from './seller/dashboard/dashboard.component';
import { SellerProductsComponent } from './seller/products/products.component';
import { ProductFormComponent } from './seller/product-form/product-form.component';
import { SellerOrdersComponent } from './seller/orders/orders.component';
import { SellerOrderDetailsComponent } from './seller/order-details/order-details.component';
import { SellerReportsComponent } from './seller/reports/reports.component';
import { SellerNavbarComponent } from './seller/shared/seller-navbar/seller-navbar.component';
import { HomeComponent } from './buyer/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ProductsComponent,
    ProductDetailComponent,
    CartComponent,
    CheckoutComponent,
    OrdersComponent,
    OrderDetailComponent,
    ProfileComponent,
    PaymentSuccessComponent,
    PaymentCancelComponent,
    SellerDashboardComponent,
    SellerProductsComponent,
    ProductFormComponent,
    SellerOrdersComponent,
    SellerOrderDetailsComponent,
    SellerReportsComponent,
    SellerNavbarComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
