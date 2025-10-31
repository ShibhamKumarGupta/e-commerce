import { Inject, Injectable, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ResponsiveTableService {
  private initialized = false;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private ngZone: NgZone
  ) {}

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.ngZone.runOutsideAngular(() => {
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => {
          setTimeout(() => this.transformAllTables(), 0);
        });

      this.transformAllTables();
      window.addEventListener('resize', this.debouncedTransform, { passive: true });
    });
  }

  private debouncedTransform = this.debounce(() => this.transformAllTables(), 200);

  private transformAllTables(): void {
    // Limit scope to seller area as requested
    const path = this.router.url || (typeof window !== 'undefined' ? window.location.pathname : '');
    if (!path.startsWith('/seller')) return;

    const tables = Array.from(this.document.querySelectorAll('table')) as HTMLTableElement[];
    for (const table of tables) {
      this.transformTable(table);
    }
  }

  private transformTable(table: HTMLTableElement): void {
    try {
      if (table.hasAttribute('data-no-responsive') || table.classList.contains('no-responsive')) {
        return;
      }
      table.classList.add('responsive-table');

      const headerCells = Array.from(table.querySelectorAll('thead th')) as HTMLTableCellElement[];
      const labels = headerCells.map((th) => (th.textContent || '').trim());

      const bodyRows = Array.from(table.querySelectorAll('tbody tr')) as HTMLTableRowElement[];
      for (const row of bodyRows) {
        const cells = Array.from(row.children).filter((el) => el.tagName.toLowerCase() === 'td') as HTMLTableCellElement[];
        let colIndex = 0;
        for (const cell of cells) {
          if (!cell.getAttribute('data-label')) {
            const label = labels[colIndex] || '';
            if (label) {
              cell.setAttribute('data-label', label);
            }
          }
          const span = Number(cell.getAttribute('colspan') || 1);
          colIndex += isNaN(span) ? 1 : Math.max(span, 1);
        }
      }
    } catch {
      // ignore transformation errors to avoid breaking UI
    }
  }

  private debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
    let t: any;
    return (...args: any[]) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }
}
