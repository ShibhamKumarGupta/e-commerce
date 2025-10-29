import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleRedirectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // If user is authenticated and trying to access public routes
    if (this.authService.isAuthenticated) {
      const userRole = this.authService.userRole;
      
      // Sellers should not access home/public buyer pages
      if (userRole === 'seller') {
        this.router.navigate(['/404']);
        return false;
      }
    }

    // Allow access for non-authenticated users and buyers
    return true;
  }
}
