import Swal from 'sweetalert2';
import { Component, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ChangePasswordRequest } from '../../../core/models/auth.model';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
    private destroyRef = inject(DestroyRef);
  form: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: ''
  };
  confirmPassword = '';
  loading = signal(false);

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  onSubmit(): void {
    if (!this.form.currentPassword || !this.form.newPassword) {
      Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'Por favor complete todos los campos.',
      confirmButtonColor: '#150fbd'
    });
      return;
    }

    if (this.form.newPassword !== this.confirmPassword) {
      Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'Las contraseñas no coinciden.',
      confirmButtonColor: '#150fbd'
    });
      return;
    }

    if (this.form.newPassword.length < 6) {
      Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'La contraseña nueva debe tener al menos 6 caracteres.',
      confirmButtonColor: '#150fbd'
    });
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo identificar al usuario actual.',
      confirmButtonColor: '#150fbd'
    });
      return;
    }

    this.loading.set(true);

    this.authService.changePassword(userId, this.form).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Su contraseña ha sido cambiada exitosamente.',
      confirmButtonColor: '#150fbd'
    });
        this.loading.set(false);
        // Opcional: Cerrar sesión después de cambiar la contraseña o redirigir al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error('ChangePassword error:', err);
        Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.error?.title || 'Error al cambiar la contraseña. Verifique su contraseña actual.',
      confirmButtonColor: '#150fbd'
    });
        this.loading.set(false);
      }
    });
  }
}
