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
    // Hide navbar on login page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showNavbar = !event.url.includes('/login');
      // Scroll to top on navigation, accounting for fixed navbar
      window.scrollTo(0, 64);
    });

    // Scroll to top on page refresh, accounting for fixed navbar
    window.scrollTo(0, 64);
  }
}
