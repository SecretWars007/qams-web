// src/app/features/auth/register/register.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/auth.model';
import Swal from 'sweetalert2';

/**
 * Componente que gestiona el registro de nuevos usuarios en el sistema.
 * Versión actualizada con campos de identidad y layout optimizado.
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
    documentoIdentidad: '',
    fechaNacimiento: '',
    telefono: '',
  };

  loading = signal(false);
  minDate: string;
  maxDate: string;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    const hoy = new Date();
    // Max: hoy - 18 años
    const max = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    // Min: hoy - 80 años
    const min = new Date(hoy.getFullYear() - 80, hoy.getMonth(), hoy.getDate());
    
    this.maxDate = max.toISOString().split('T')[0];
    this.minDate = min.toISOString().split('T')[0];
  }

  /**
   * Envía los datos del formulario al servicio de autenticación.
   */
  onSubmit(): void {
    if (
      !this.form.username ||
      !this.form.email ||
      !this.form.password ||
      !this.form.fullName ||
      !this.form.documentoIdentidad ||
      !this.form.fechaNacimiento
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Por favor, complete todos los campos obligatorios.',
        confirmButtonColor: '#150fbd'
      });
      return;
    }

    this.loading.set(true);

    // Validación de edad (18-80 años)
    const fechaNac = new Date(this.form.fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (edad < 18 || edad > 80) {
      this.loading.set(false);
      Swal.fire({
        icon: 'warning',
        title: 'Edad no permitida',
        text: 'El registro solo está permitido para personas entre 18 y 80 años.',
        confirmButtonColor: '#150fbd'
      });
      return;
    }

    this.authService.register(this.form).subscribe({
      next: () => {
        console.log('[RegisterComponent] Registro exitoso para:', this.form.username);
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión.',
          confirmButtonColor: '#150fbd'
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('[RegisterComponent] Error en el registro:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de Registro',
          text: 'No se pudo completar el registro. Verifique que el usuario o correo no existan.',
          confirmButtonColor: '#150fbd'
        });
        this.loading.set(false);
      },
    });
  }
}
