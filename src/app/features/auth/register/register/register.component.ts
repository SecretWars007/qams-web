// src/app/features/auth/register/register.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/auth.model';

/**
 * Componente que gestiona el registro de nuevos usuarios en el sistema.
 * Recopila nombre, email, usuario (username) y contraseña mediante `AuthService`.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: RegisterRequest = {
    username: '',
    email: '',
    password: '',
    fullName: '',
  };

  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  /**
   * Envía los datos del formulario al servicio de autenticación.
   * Maneja el estado de carga y notificaciones de éxito/error.
   */
  onSubmit(): void {
    if (
      !this.form.username ||
      !this.form.email ||
      !this.form.password ||
      !this.form.fullName
    ) {
      this.toastr.warning('Complete todos los campos.', 'Atención');
      return;
    }

    this.loading.set(true);

    this.authService.register(this.form).subscribe({
      next: () => {
        console.log('[RegisterComponent] Registro exitoso, procediendo a dashboard');
        this.toastr.success('Cuenta creada exitosamente.', '¡Bienvenido!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('[RegisterComponent] Error durante el registro:', err);
        this.loading.set(false);
      },
    });
  }
}
