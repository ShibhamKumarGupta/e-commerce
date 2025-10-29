import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Admin Panel';
  showNavbar = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Hide navbar on login page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showNavbar = !event.url.includes('/login');
      this.scrollToTop();
    });

    this.scrollToTop();
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
}
