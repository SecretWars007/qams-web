// src/app/features/auth/login/login.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // Modelo del formulario
  form: LoginRequest = { username: '', password: '' };

  // Estado de carga
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  onSubmit(): void {
    // Validar que los campos no estén vacíos
    if (!this.form.username || !this.form.password) {
      this.toastr.warning('Complete todos los campos.', 'Atención');
      return;
    }

    this.loading.set(true);

    this.authService.login(this.form).subscribe({
      next: () => {
        console.log('LoginComponent: Login exitoso, procediendo a dashboard');
        this.loading.set(false);
        this.toastr.success('Bienvenido al sistema.', '¡Hola!');
        this.router.navigate(['/dashboard']).then(nav => {
          console.log('Navegación a dashboard completa:', nav);
        }).catch(err => {
          console.error('Error en navegación a dashboard:', err);
        });
      },
      error: (err) => {
        console.error('LoginComponent: Error en login:', err);
        this.loading.set(false);
      },
    });
  }
}
