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

  // Obtenemos la instancia de forma "lazy" y solo si estamos en el navegador
  private getToast() {
    if (!this.isBrowser) return null;
    
    if (!this.toastInstance) {
      this.toastInstance = Swal.mixin({
        position: 'center',
        showConfirmButton: true,
        confirmButtonColor: '#150fbd',
        timer: 3000,
        timerProgressBar: true,
        background: '#ffffff',
        color: '#1e293b', // slate-800
        customClass: {
          popup: 'rounded-3xl border border-slate-100 shadow-2xl p-6',
          title: 'text-xl font-bold tracking-tight text-slate-900',
          htmlContainer: 'text-sm text-slate-500 font-medium',
          confirmButton: 'px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all hover:scale-105',
          timerProgressBar: 'bg-[#150fbd]'
        },
        buttonsStyling: true
      });
    }
    return this.toastInstance;
  }

  success(message: string, title: string = '¡Éxito!') {
    this.getToast()?.fire({
      icon: 'success',
      title: title,
      text: message,
      iconColor: '#10b981', // emerald-500
      showConfirmButton: false,
      timer: 2000
    });
  }

  error(message: string, title: string = 'Error') {
    this.getToast()?.fire({
      icon: 'error',
      title: title,
      text: message,
      iconColor: '#ef4444', // red-500
      timer: undefined, // Los errores no se cierran solos
      showConfirmButton: true
    });
  }

  warning(message: string, title: string = 'Atención') {
    this.getToast()?.fire({
      icon: 'warning',
      title: title,
      text: message,
      iconColor: '#f59e0b', // amber-500
      timer: 4000,
      showConfirmButton: true
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
