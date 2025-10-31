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
      // Re-run after every navigation so newly rendered tables are transformed
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(() => {
          // Delay to ensure view has rendered
          setTimeout(() => this.transformAllTables(), 0);
        });

      // Initial run
      this.transformAllTables();

      // Re-run on resize (debounced)
      window.addEventListener('resize', this.debouncedTransform, { passive: true });
    });
  }

  private debouncedTransform = this.debounce(() => this.transformAllTables(), 200);

  private transformAllTables(): void {
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
        // Only process TDs
        const cells = Array.from(row.children).filter((el) => el.tagName.toLowerCase() === 'td') as HTMLTableCellElement[];
        let colIndex = 0;
        for (const cell of cells) {
          // If label already set, don't override
          if (!cell.getAttribute('data-label')) {
            const label = labels[colIndex] || '';
            if (label) {
              cell.setAttribute('data-label', label);
            }
          }
          // Advance by colspan if present
          const span = Number(cell.getAttribute('colspan') || 1);
          colIndex += isNaN(span) ? 1 : Math.max(span, 1);
        }
      }
    } catch {
      // No-op on transform errors
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
