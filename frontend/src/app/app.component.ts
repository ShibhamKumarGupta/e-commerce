import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ResponsiveTableService } from './core/services/responsive-table.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ecommerce-frontend';
  showHeaderFooter = true;

  constructor(private router: Router, private responsiveTable: ResponsiveTableService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide header/footer for seller routes (they have their own navbar)
      this.showHeaderFooter = !event.url.startsWith('/seller');
      // Scroll to top on navigation
      this.scrollToTop();
    });
  }

  ngOnInit(): void {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    this.scrollToTop();

    // Initialize global responsive-table behavior
    this.responsiveTable.init();
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
}
