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
  styles: [`
    .qams-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.3s ease-out;
    }

    .qams-loading-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 3rem;
      border-radius: 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .paw-container {
      position: relative;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .paw-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    .paw-icon {
      font-size: 3rem;
      color: #fff;
      filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
      animation: pulse 2s infinite;
    }

    .loading-text {
      color: #fff;
      font-size: 0.8rem;
      font-weight: 900;
      letter-spacing: 0.3em;
      margin-top: 1rem;
      text-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }

    .loading-dots {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .dot {
      width: 6px;
      height: 6px;
      background: #fff;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .dot:nth-child(1) { animation-delay: -0.32s; background: rgba(255,255,255,0.4); }
    .dot:nth-child(2) { animation-delay: -0.16s; }
    .dot:nth-child(3) { background: rgba(255,255,255,0.4); }

    .encryption-hint {
      margin-top: 2.5rem;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.4);
      font-weight: 700;
      letter-spacing: 0.1em;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ping { 75%, 100% { transform: scale(1.5); opacity: 0; } }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.95); } }
    @keyframes bounce { 
      0%, 80%, 100% { transform: scale(0); } 
      40% { transform: scale(1.0); } 
    }
  `]
})
export class LoadingOverlayComponent {
  public readonly loadingService = inject(LoadingService);
}
