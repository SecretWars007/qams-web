import { Injectable, signal } from '@angular/core';

/**
 * Servicio reactivo para gestionar el estado de carga global de la aplicación.
 * Utiliza Angular Signals para una detección de cambios eficiente.
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = signal(0);

  /**
   * Señal pública que indica si hay al menos una petición en curso.
   */
  isLoading = signal(false);

  /**
   * Incrementa el contador de peticiones activas.
   */
  show(): void {
    this.activeRequests.update((val) => val + 1);
    this.isLoading.set(true);
  }

  /**
   * Decrementa el contador de peticiones activas.
   * Si el contador llega a cero, establece isLoading a false.
   */
  hide(): void {
    this.activeRequests.update((val) => {
      const newVal = val > 0 ? val - 1 : 0;
      if (newVal === 0) {
        this.isLoading.set(false);
      }
      return newVal;
    });
  }
}
