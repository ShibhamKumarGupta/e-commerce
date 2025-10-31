import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { UsersComponent } from './users/users.component';
import { ProductsComponent } from './products/products.component';
import { OrdersComponent } from './orders/orders.component';
import { ProfileComponent } from './profile/profile.component';
import { ReportsComponent } from './reports/reports.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { CategoriesComponent } from './categories/categories.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { NotFoundComponent } from './not-found/not-found.component';
import { ReviewModerationComponent } from './review-moderation/review-moderation.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    UsersComponent,
    ProductsComponent,
    OrdersComponent,
    ProfileComponent,
    ReportsComponent,
    OrderDetailsComponent,
    CategoriesComponent,
    NavbarComponent,
    NotFoundComponent,
    ReviewModerationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
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
