import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email = '';
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastService,
  ) { }

  onSubmit(): void {
    if (!this.email) {
      this.toastr.warning('Por favor ingrese su correo electrónico.', 'Atención');
      return;
    }

    this.loading.set(true);

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: (message) => {
        this.toastr.success(message || 'Instrucciones enviadas a su correo.', 'Éxito');
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('ForgotPassword error:', err);
        // By security, do not reveal if the email is not found. Keep it generic if possible.
        this.toastr.error('Error al procesar la solicitud. Intente nuevamente.', 'Error');
        this.loading.set(false);
      }
    });
  }
}
