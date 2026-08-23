import Swal from 'sweetalert2';
import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ResetPasswordRequest } from '../../../core/models/auth.model';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
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
  ) { }

  ngOnInit(): void {
    // Intentar obtener email y token de la URL (ej: /auth/reset-password?email=...&token=...)
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
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
      Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'Por favor complete todos los campos.',
      confirmButtonColor: '#10B981'
    });
      return;
    }

    if (this.form.newPassword !== this.confirmPassword) {
      Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'Las contraseñas no coinciden.',
      confirmButtonColor: '#10B981'
    });
      return;
    }

    if (this.form.newPassword.length < 6) {
      Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'La contraseña debe tener al menos 6 caracteres.',
      confirmButtonColor: '#10B981'
    });
      return;
    }

    this.loading.set(true);

    this.authService.resetPassword(this.form).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Su contraseña ha sido restablecida exitosamente.',
      confirmButtonColor: '#10B981'
    });
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err: any) => {
        console.error('ResetPassword error:', err);
        Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.error?.title || 'Error al restablecer la contraseña. El token puede ser inválido o haber expirado.',
      confirmButtonColor: '#10B981'
    });
        this.loading.set(false);
      }
    });
  }
}
