import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private isBrowser: boolean;
  private toastInstance: typeof Swal | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Obtenemos la instancia de forma "lazy" (perezosa) y solo si estamos en el navegador
  private getToast() {
    if (!this.isBrowser) return null;
    
    if (!this.toastInstance) {
      this.toastInstance = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'rgba(17, 24, 39, 0.95)', // bg-gray-900 con opacidad
        color: '#f9fafb', // text-gray-50
        customClass: {
          popup: 'border border-slate-700/50 shadow-2xl backdrop-blur-md rounded-xl',
          title: 'text-sm font-semibold tracking-wide',
          timerProgressBar: 'bg-gradient-to-r from-blue-500 to-purple-500'
        },
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
    }
    return this.toastInstance;
  }

  success(message: string, title?: string) {
    this.getToast()?.fire({
      icon: 'success',
      title: title ? `${title} - ${message}` : message,
      iconColor: '#10b981' // emerald-500
    });
  }

  error(message: string, title?: string) {
    this.getToast()?.fire({
      icon: 'error',
      title: title ? `${title} - ${message}` : message,
      iconColor: '#ef4444', // red-500
      timer: 5000 // Da más tiempo para leer errores
    });
  }

  warning(message: string, title?: string) {
    this.getToast()?.fire({
      icon: 'warning',
      title: title ? `${title} - ${message}` : message,
      iconColor: '#f59e0b', // amber-500
      timer: 4000
    });
  }

  info(message: string, title?: string) {
    this.getToast()?.fire({
      icon: 'info',
      title: title ? `${title} - ${message}` : message,
      iconColor: '#3b82f6' // blue-500
    });
  }
}
