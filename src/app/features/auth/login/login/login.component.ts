// src/app/features/auth/login/login.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';

/**
 * Componente que gestiona el inicio de sesión de los usuarios.
 * Recopila credenciales y delega la autenticación a `AuthService`.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // Modelo del formulario
  form = { username: '', password: '' };

  // Estado de carga
  loading = signal<boolean>(false);

  // Estado reactivo para el foco de los campos
  private readonly focusedFields = signal<Record<string, boolean>>({});

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  setFieldFocus(fieldName: string, isFocused: boolean) {
    this.focusedFields.update(state => ({ ...state, [fieldName]: isFocused }));
  }

  isFieldFocused(fieldName: string): boolean {
    return !!this.focusedFields()[fieldName];
  }

  /**
   * Envía las credenciales al servicio de autenticación.
   * Maneja el estado de carga y navegaciones posteriores al login exitoso.
   */
  onSubmit(): void {
    // Validar que los campos no estén vacíos
    if (!this.form.username || !this.form.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Todos los campos son obligatorios.',
        confirmButtonColor: '#150fbd'
      });
      return;
    }

    this.loading.set(true);

    this.authService.login(this.form).subscribe({
      next: () => {
        console.log('[LoginComponent] Login exitoso, procediendo a dashboard');
        this.loading.set(false);
        
        // Alerta de éxito optimizada (auto-dismiss)
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Inicio de sesión exitoso.',
          timer: 1500,
          showConfirmButton: false
        });
        
        // Navegación inmediata
        this.router.navigate(['/dashboard']).then(nav => {
          console.log('[LoginComponent] Navegación a dashboard completa:', nav);
        }).catch(err => {
          console.error('[LoginComponent] Error en navegación a dashboard:', err);
        });
      },
      error: (err) => {
        console.error('[LoginComponent] Error en login:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de Acceso',
          text: 'Credenciales inválidas o error de conexión.',
          confirmButtonColor: '#150fbd'
        });
        this.loading.set(false);
      },
    });
  }
}
