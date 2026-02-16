// src/app/features/auth/register/register.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/auth.model';

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
        this.toastr.success('Cuenta creada exitosamente.', '¡Bienvenido!');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
