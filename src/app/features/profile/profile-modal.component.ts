import { Component, OnInit, signal, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { RolesService } from '../../core/services/roles.service';
import { Role } from '../../core/models/role.model';
import { UpdateUser } from '../../core/models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.scss'
})
export class ProfileModalComponent implements OnInit {
  show = signal(false);
  loading = signal(false);
  profileUpdated = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);

  profileForm: FormGroup;
  private currentUserData: any = null;
  private readonly allRoles = signal<Role[]>([]);

  constructor() {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.rolesService.getRoles().subscribe(roles => this.allRoles.set(roles));
  }

  open() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.loading.set(true);
    this.usersService.getUserById(userId).subscribe({
      next: (user) => {
        this.currentUserData = user;
        this.profileForm.patchValue({
          fullName: user.fullName,
          email: user.email
        });
        this.show.set(true);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  close() {
    this.show.set(false);
  }

  onSubmit() {
    if (this.profileForm.invalid || !this.currentUserData) return;

    this.loading.set(true);
    const formValue = this.profileForm.value;

    // Obtener IDs de roles actuales (necesarios para el DTO)
    const roleIds = this.allRoles()
      .filter(r => this.currentUserData.roles.includes(r.name))
      .map(r => r.id);

    const updateDto: UpdateUser = {
      fullName: formValue.fullName,
      email: formValue.email,
      isActive: this.currentUserData.isActive,
      roleIds: roleIds
    };

    this.usersService.updateUser(this.currentUserData.id, updateDto).subscribe({
      next: () => {
        // Actualizar datos del usuario localmente para reflejar cambios en la UI
        this.authService.updateUserClaims(formValue.fullName, formValue.email);

        this.loading.set(false);
        this.profileUpdated.emit();
        this.close();
        Swal.fire({
          title: '¡Actualizado!',
          text: 'Tu perfil ha sido actualizado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: () => {
        this.loading.set(false);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar tu perfil.',
          icon: 'error',
          confirmButtonColor: '#150fbd'
        });
      }
    });
  }
}
