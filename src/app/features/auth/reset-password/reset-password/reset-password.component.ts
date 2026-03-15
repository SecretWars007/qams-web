import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';
import { ResetPasswordRequest } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: ResetPasswordRequest = {
    email: '',
    resetToken: '',
    newPassword: ''
  };
  confirmPassword = '';
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    // Intentar obtener email y token de la URL (ej: /auth/reset-password?email=...&token=...)
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.form.email = params['email'];
      }
      if (params['token']) {
        this.form.resetToken = decodeURIComponent(params['token']);
      }
    });
  }

  onSubmit(): void {
    if (!this.form.email || !this.form.resetToken || !this.form.newPassword) {
      this.toastr.warning('Por favor complete todos los campos.', 'Atención');
      return;
    }

    if (this.form.newPassword !== this.confirmPassword) {
      this.toastr.warning('Las contraseñas no coinciden.', 'Atención');
      return;
    }

    if (this.form.newPassword.length < 6) {
      this.toastr.warning('La contraseña debe tener al menos 6 caracteres.', 'Atención');
      return;
    }

    this.loading.set(true);

    this.authService.resetPassword(this.form).subscribe({
      next: () => {
        this.toastr.success('Su contraseña ha sido restablecida exitosamente.', 'Éxito');
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('ResetPassword error:', err);
        this.toastr.error(err.error?.title || 'Error al restablecer la contraseña. El token puede ser inválido o haber expirado.', 'Error');
        this.loading.set(false);
      }
    });
  }
}
