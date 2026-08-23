import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { RolesService } from '../../../core/services/roles.service';
import { AuthService } from '../../../core/services/auth.service';
import { User, UpdateUser } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly authService = inject(AuthService); // Inyectar AuthService
  private readonly fb = inject(FormBuilder);

  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  
  // Date Restrictions (18-80 years)
  minDate: string;
  maxDate: string;

  // Modal State: Edit
  showEditModal = signal(false);
  editForm: FormGroup;
  selectedUser: User | null = null;

  // Modal State: Create
  showCreateModal = signal(false);
  createForm: FormGroup;

  constructor() {
    const hoy = new Date();
    const max = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    const min = new Date(hoy.getFullYear() - 80, hoy.getMonth(), hoy.getDate());
    this.maxDate = max.toISOString().split('T')[0];
    this.minDate = min.toISOString().split('T')[0];

    this.editForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      isActive: [true],
      documentoIdentidad: ['', [Validators.required, Validators.maxLength(20)]],
      fechaNacimiento: ['', [Validators.required]],
      telefono: ['', [Validators.pattern(/^\+[1-9]\d{1,14}$/)]]
    });

    this.createForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      documentoIdentidad: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9\s-]+$/)]],
      fechaNacimiento: ['', [Validators.required]],
      telefono: ['', [Validators.pattern(/^\+[1-9]\d{1,14}$/)]],
      roleId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.usersService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        // Filtrar usuarios eliminados lógicamente (tanto is_deleted como isDeleted por formato JSON)
        const activeUsers = data.filter(u => u.is_deleted !== true && u.isDeleted !== true);
        this.users.set(activeUsers);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    // Cargar roles para el selector
    this.rolesService.getRoles().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.roles.set(data)
    });
  }

  onAssignRole(userId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const roleId = select.value;

    if (!roleId) return;

    const user = this.users().find(u => u.id === userId);
    const roleObj = this.roles().find(r => r.id === roleId);
    
    if (!roleObj) return;

    if (user?.roles.includes(roleObj.name)) {
      Swal.fire({
        title: 'Rol ya asignado',
        text: `El usuario ya cuenta con el rol "${roleObj.name}".`,
        icon: 'info',
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Entendido',
        background: '#ffffff'
      });
      select.value = '';
      return;
    }

    this.processAssignRole(userId, roleId, roleObj, select);
  }

  private async processAssignRole(userId: string, roleId: string, roleObj: Role, select: HTMLSelectElement): Promise<void> {
    try {
      await firstValueFrom(this.usersService.assignRole(userId, roleId));

      // Optimistic Update
      this.users.update(users => users.map(u => {
        if (u.id === userId && !u.roles.includes(roleObj.name)) {
          return { ...u, roles: [...u.roles, roleObj.name] };
        }
        return u;
      }));

      // Refresh to sync with server
      this.loadData();
      
      select.value = '';
      Swal.fire({
        title: 'Asignado',
        text: 'El rol ha sido asignado correctamente.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error assigning role:', error);
      Swal.fire('Error', 'No se pudo asignar el rol.', 'error');
    }
  }

  async onRemoveRole(userId: string, roleName: string): Promise<void> {
    const roleObj = this.roles().find(r => r.name === roleName);
    if (!roleObj) return;

    const result = await Swal.fire({
      title: '¿Quitar rol?',
      text: `¿Desea remover el rol "${roleName}" de este usuario?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#ff0033',
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Mantener',
      background: '#ffffff'
    });

    if (result.isConfirmed) {
      try {
        await firstValueFrom(this.usersService.removeRole(userId, roleObj.id));

        // Optimistic Update
        this.users.update(users => users.map(u => {
          if (u.id === userId) {
            return { ...u, roles: u.roles.filter(r => r !== roleName) };
          }
          return u;
        }));

        // Refresh to sync with server
        this.loadData();

        Swal.fire({
          title: '¡Rol removido!',
          text: 'El rol ha sido quitado satisfactoriamente.',
          icon: 'success',
          confirmButtonColor: '#10B981',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error removing role:', error);
        Swal.fire('Error', 'No se pudo remover el rol.', 'error');
      }
    }
  }

  onDeleteUser(userId: string): void {
    const user = this.users().find(u => u.id === userId);
    if (user?.roles?.length) {
      Swal.fire({
        title: 'Acceso denegado',
        text: 'No se puede eliminar un usuario que tiene roles asignados. Por favor, retira todos los roles antes de intentar eliminarlo.',
        icon: 'error',
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Entendido',
        background: '#ffffff'
      });
      return;
    }

    Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#ff0033',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed) {
        // Optimistic: remove from local list immediately
        const previousUsers = this.users();
        this.users.set(previousUsers.filter(u => u.id !== userId));

        this.usersService.deleteUser(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El usuario ha sido eliminado correctamente.',
              icon: 'success',
              confirmButtonColor: '#10B981',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('[UsersComponent] Error al eliminar usuario:', err);
            // Revert optimistic update
            this.users.set(previousUsers);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar el usuario. Verifique sus permisos.',
              icon: 'error',
              confirmButtonColor: '#10B981'
            });
          }
        });
      }
    });
  }

  onToggleStatus(user: User): void {
    const newStatus = !user.isActive;

    if (!newStatus && user.roles && user.roles.length > 0) {
      Swal.fire({
        title: 'Acceso denegado',
        text: 'No se puede inactivar al usuario si tiene roles asignados. Por favor, retira todos los roles antes de inactivarlo.',
        icon: 'error',
        confirmButtonColor: '#10B981',
        confirmButtonText: 'Entendido',
        background: '#ffffff'
      });
      return;
    }

    const action = newStatus ? 'activar' : 'inactivar';

    Swal.fire({
      title: `¿Deseas ${action} al usuario?`,
      text: `El usuario será marcado como ${newStatus ? 'activo' : 'inactivo'}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#ff4444',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed) {
        // Obtenemos los roleIds actuales para el DTO
        const roleIds = this.roles()
          .filter(r => user.roles.includes(r.name))
          .map(r => r.id);

        this.usersService.updateUser(user.id, {
                    email: user.email,
                    fullName: user.fullName,
                    isActive: newStatus,
                    roleIds: roleIds
                  }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            this.loadData();
            Swal.fire({
              title: '¡Actualizado!',
              text: `El usuario ha sido ${newStatus ? 'activado' : 'inactivado'} correctamente.`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

  // --- Modal Logic ---

  openEditModal(user: User): void {
    this.selectedUser = user;
    this.editForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive,
      documentoIdentidad: user.documentoIdentidad,
      fechaNacimiento: user.fechaNacimiento ? user.fechaNacimiento.split('T')[0] : ''
    });
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedUser = null;
    this.editForm.reset();
  }

  toggleRole(roleId: string): void {
    if (!this.selectedUser) return;
    const roleObj = this.roles().find(r => r.id === roleId);
    if (!roleObj) return;

    if (this.selectedUser.roles.includes(roleObj.name)) {
      this.selectedUser.roles = this.selectedUser.roles.filter(name => name !== roleObj.name);
    } else {
      this.selectedUser.roles = [...this.selectedUser.roles, roleObj.name];
    }
  }

  isRoleSelected(roleId: string): boolean {
    if (!this.selectedUser) return false;
    const roleObj = this.roles().find(r => r.id === roleId);
    return roleObj ? this.selectedUser.roles.includes(roleObj.name) : false;
  }

  updateUserData(): void {
    if (this.editForm.invalid || !this.selectedUser) return;

    this.isSubmitting.set(true);
    const formValue = this.editForm.value;

    // Validación de Edad en Edición
    if (!this.isValidAge(formValue.fechaNacimiento)) {
      this.isSubmitting.set(false);
      Swal.fire({
        icon: 'warning',
        title: 'Edad no permitida',
        text: 'La edad del usuario debe estar entre 18 y 80 años.',
        confirmButtonColor: '#10B981'
      });
      return;
    }

    // Obtenemos los roleIds actuales para el DTO
    const roleIds = this.roles()
      .filter(r => this.selectedUser!.roles.includes(r.name))
      .map(r => r.id);

    const updateDto: UpdateUser = {
      fullName: formValue.fullName,
      email: formValue.email,
      isActive: formValue.isActive,
      documentoIdentidad: formValue.documentoIdentidad,
      fechaNacimiento: formValue.fechaNacimiento,
      telefono: formValue.telefono,
      roleIds: roleIds
    };

    this.usersService.updateUser(this.selectedUser.id, updateDto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.loadData();
        this.closeEditModal();
        Swal.fire({
          title: '¡Actualizado!',
          text: 'La información del usuario ha sido actualizada correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('[UsersComponent] Error updating user:', err);
        this.isSubmitting.set(false);
        const errorMsg = err.error?.message || 'No se pudo actualizar la información del usuario.';
        Swal.fire({
          title: 'Error de actualización',
          text: errorMsg,
          icon: 'error',
          confirmButtonColor: '#10B981'
        });
      }
    });
  }

  // --- Create Modal Logic ---

  openCreateModal(): void {
    this.createForm.reset({
      isActive: true,
      roleId: ''
    });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.createForm.reset();
  }

  onCreateUser(): void {
    if (this.createForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.createForm.value;

    // Validación de Edad en Creación
    if (!this.isValidAge(formValue.fechaNacimiento)) {
      this.isSubmitting.set(false);
      Swal.fire({
        icon: 'warning',
        title: 'Edad no permitida',
        text: 'El usuario debe tener entre 18 y 80 años para ser actualizado.',
        confirmButtonColor: '#10B981'
      });
      return;
    }

    const createDto = {
      username: formValue.username,
      fullName: formValue.fullName,
      email: formValue.email,
      password: formValue.password,
      documentoIdentidad: formValue.documentoIdentidad,
      fechaNacimiento: formValue.fechaNacimiento,
      telefono: formValue.telefono,
      roleIds: [formValue.roleId]
    };

    this.usersService.createUser(createDto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.loadData();
        this.closeCreateModal();
        Swal.fire({
          title: '¡Creado!',
          text: 'El nuevo usuario ha sido registrado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('[UsersComponent] Error creating user:', err);
        this.isSubmitting.set(false);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo registrar el usuario. Verifique los datos.',
          icon: 'error',
          confirmButtonColor: '#10B981'
        });
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * Verifica si la fecha de nacimiento corresponde a una edad entre 18 y 80 años.
   */
  private isValidAge(fechaNacimiento: string): boolean {
    if (!fechaNacimiento) return false;
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad >= 18 && edad <= 80;
  }
}
