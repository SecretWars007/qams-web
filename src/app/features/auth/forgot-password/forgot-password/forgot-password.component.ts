import Swal from 'sweetalert2';
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  ) { }

  onSubmit(): void {
    if (!this.email) {
      Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'Por favor ingrese su correo electrónico.',
      confirmButtonColor: '#150fbd'
    });
      return;
    }

    this.loading.set(true);

    this.authService.forgotPassword({ email: this.email }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Solicitud Enviada',
          text: 'Si el correo ingresado es correcto, recibirá un mensaje con las instrucciones para restablecer su contraseña en unos instantes.',
          confirmButtonColor: '#150fbd'
        });
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('ForgotPassword error:', err);
        // By security, do not reveal if the email is not found. Keep it generic if possible.
        Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al procesar la solicitud. Intente nuevamente.',
      confirmButtonColor: '#150fbd'
    });
        this.loading.set(false);
      }
    });
  }
}
