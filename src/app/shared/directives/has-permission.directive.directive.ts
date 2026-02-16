// src/app/shared/directives/has-permission.directive.ts
// Directiva estructural para mostrar/ocultar elementos según permisos
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/**
 * Uso en templates:
 * <button *hasPermission="'USERS_CREATE'">Crear Usuario</button>
 * Solo se renderiza si el usuario tiene el permiso USERS_CREATE.
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit {
  // Permiso requerido recibido como input
  @Input('hasPermission') permission: string = '';

  // Flag para evitar renderizar múltiples veces
  private isRendered = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    // Verificar si el usuario tiene el permiso
    if (this.authService.hasPermission(this.permission)) {
      // Si tiene permiso y no está renderizado, mostrar el elemento
      if (!this.isRendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isRendered = true;
      }
    } else {
      // Si no tiene permiso, ocultar el elemento
      this.viewContainer.clear();
      this.isRendered = false;
    }
  }
}
