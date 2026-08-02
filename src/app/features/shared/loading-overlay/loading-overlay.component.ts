import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

/**
 * Componente de nivel superior para mostrar un indicador
 * de carga global con visibilidad garantizada (z-index altísimo).
 */
@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loadingService.isLoading()" class="qams-loading-overlay">
      <div class="qams-loading-card">
        <!-- Icono de Huella Animado -->
        <div class="paw-container">
          <div class="paw-ring"></div>
          <i class="fas fa-paw paw-icon"></i>
        </div>

        <!-- Texto y Animación de Carga -->
        <span class="loading-text">Procesando solicitud</span>
        <div class="loading-dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>

        <p class="encryption-hint">Asegurando transmisión de datos | AES-256</p>
      </div>
    </div>
  `,
  styleUrl: './loading-overlay.component.scss'
})
export class LoadingOverlayComponent {
  public readonly loadingService = inject(LoadingService);
}
