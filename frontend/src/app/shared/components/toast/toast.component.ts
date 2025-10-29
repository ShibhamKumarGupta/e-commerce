import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];
  private readonly palette: Record<string, {
    border: string;
    iconBg: string;
    iconColor: string;
    gradient: string;
    accentBar: string;
    progress: string;
  }> = {
    success: {
      border: 'border-emerald-200/70 shadow-emerald-500/15',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      gradient: 'from-emerald-500/10 via-white/95 to-white',
      accentBar: 'bg-emerald-500',
      progress: 'bg-emerald-400'
    },
    error: {
      border: 'border-rose-200/70 shadow-rose-500/15',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      gradient: 'from-rose-500/10 via-white/95 to-white',
      accentBar: 'bg-rose-500',
      progress: 'bg-rose-400'
    },
    warning: {
      border: 'border-amber-200/70 shadow-amber-500/15',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      gradient: 'from-amber-500/10 via-white/95 to-white',
      accentBar: 'bg-amber-500',
      progress: 'bg-amber-400'
    },
    info: {
      border: 'border-sky-200/70 shadow-sky-500/15',
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      gradient: 'from-sky-500/10 via-white/95 to-white',
      accentBar: 'bg-sky-500',
      progress: 'bg-sky-400'
    }
  };

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);
      
      if (toast.duration) {
        setTimeout(() => {
          this.remove(toast.id);
        }, toast.duration);
      }
    });
  }

  remove(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  private getPalette(type: string) {
    return this.palette[type] || this.palette['info'];
  }

  getToastClass(type: string): string {
    const palette = this.getPalette(type);
    return `bg-white/95 backdrop-blur border ${palette.border}`;
  }

  getIconBgClass(type: string): string {
    return this.getPalette(type).iconBg;
  }

  getIconColorClass(type: string): string {
    return this.getPalette(type).iconColor;
  }

  getGradientClass(type: string): string {
    return this.getPalette(type).gradient;
  }

  getAccentBarClass(type: string): string {
    return this.getPalette(type).accentBar;
  }

  getProgressClass(type: string): string {
    return this.getPalette(type).progress;
  }

  getTitle(type: string): string {
    const titles: any = {
      'success': 'Success',
      'error': 'Error',
      'warning': 'Warning',
      'info': 'Information'
    };
    return titles[type] || 'Notification';
  }

  getIcon(type: string): string {
    const icons: any = {
      'success': 'M5 13l4 4L19 7',
      'error': 'M6 18L18 6M6 6l12 12',
      'warning': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      'info': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[type] || icons['info'];
  }
}
