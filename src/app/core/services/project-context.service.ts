import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProjectContextService {
  private readonly STORAGE_KEY = 'qams_active_project_id';
  
  // Usamos una señal para mantener reactividad en toda la app
  private readonly _activeProjectId = signal<string | null>(this.getStoredProjectId());

  // Señal de solo lectura para los componentes
  readonly activeProjectId = this._activeProjectId.asReadonly();
  
  // Computed para verificar si hay un proyecto seleccionado
  readonly hasActiveProject = computed(() => this._activeProjectId() !== null);

  constructor() {}

  /**
   * Cambia el proyecto activo y lo guarda en localStorage
   */
  setActiveProject(projectId: string): void {
    if (projectId) {
      localStorage.setItem(this.STORAGE_KEY, projectId);
      this._activeProjectId.set(projectId);
    }
  }

  /**
   * Limpia el proyecto activo (ej. al hacer logout)
   */
  clearActiveProject(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this._activeProjectId.set(null);
  }

  /**
   * Intenta obtener un projectId inicial válido, útil si localStorage está vacío
   * pero tenemos la lista de proyectos del backend.
   */
  initializeIfEmpty(fallbackProjectId: string): void {
    if (!this._activeProjectId()) {
      this.setActiveProject(fallbackProjectId);
    }
  }

  private getStoredProjectId(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }
}
