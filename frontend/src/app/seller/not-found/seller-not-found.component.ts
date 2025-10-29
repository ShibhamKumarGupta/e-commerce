import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-not-found',
  templateUrl: './seller-not-found.component.html',
  styleUrls: ['./seller-not-found.component.css']
})
export class SellerNotFoundComponent {
  constructor(private router: Router) {}

  goToDashboard(): void {
    this.router.navigate(['/seller/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }
}
