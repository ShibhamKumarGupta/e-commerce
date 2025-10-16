import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

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

  getToastClass(type: string): string {
    const classes: any = {
      'success': 'bg-white border-green-500',
      'error': 'bg-white border-red-500',
      'warning': 'bg-white border-yellow-500',
      'info': 'bg-white border-blue-500'
    };
    return classes[type] || 'bg-white border-gray-500';
  }

  getIconBgClass(type: string): string {
    const classes: any = {
      'success': 'bg-green-100',
      'error': 'bg-red-100',
      'warning': 'bg-yellow-100',
      'info': 'bg-blue-100'
    };
    return classes[type] || 'bg-gray-100';
  }

  getIconColorClass(type: string): string {
    const classes: any = {
      'success': 'text-green-600',
      'error': 'text-red-600',
      'warning': 'text-yellow-600',
      'info': 'text-blue-600'
    };
    return classes[type] || 'text-gray-600';
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
