import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ChangePasswordRequest } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  form: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: ''
  };
  confirmPassword = '';
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastService,
  ) { }

  onSubmit(): void {
    if (!this.form.currentPassword || !this.form.newPassword) {
      this.toastr.warning('Por favor complete todos los campos.', 'Atención');
      return;
    }

    if (this.form.newPassword !== this.confirmPassword) {
      this.toastr.warning('Las contraseñas no coinciden.', 'Atención');
      return;
    }

    if (this.form.newPassword.length < 6) {
      this.toastr.warning('La contraseña nueva debe tener al menos 6 caracteres.', 'Atención');
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.toastr.error('No se pudo identificar al usuario actual.', 'Error');
      return;
    }

    this.loading.set(true);

    this.authService.changePassword(userId, this.form).subscribe({
      next: () => {
        this.toastr.success('Su contraseña ha sido cambiada exitosamente.', 'Éxito');
        this.loading.set(false);
        // Opcional: Cerrar sesión después de cambiar la contraseña o redirigir al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('ChangePassword error:', err);
        this.toastr.error(err.error?.title || 'Error al cambiar la contraseña. Verifique su contraseña actual.', 'Error');
        this.loading.set(false);
      }
    });
  }
}
