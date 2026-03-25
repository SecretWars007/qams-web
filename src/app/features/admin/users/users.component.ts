import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../core/services/users.service';
import { RolesService } from '../../../core/services/roles.service';
import { User } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);

  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    // Cargar usuarios
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    // Cargar roles para el selector
    this.rolesService.getRoles().subscribe({
      next: (data) => this.roles.set(data)
    });
  }

  onAssignRole(userId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const roleId = select.value;

    if (!roleId) return;

    const user = this.users().find(u => u.id === userId);
    const roleObj = this.roles().find(r => r.id === roleId);

    if (user && roleObj && user.roles.includes(roleObj.name)) {
      Swal.fire({
        title: 'Rol ya asignado',
        text: `El usuario ya cuenta con el rol "${roleObj.name}".`,
        icon: 'info',
        confirmButtonColor: '#150fbd',
        confirmButtonText: 'Entendido',
        background: '#ffffff'
      });
      select.value = '';
      return;
    }

    this.usersService.assignRole(userId, roleId).subscribe({
      next: () => {
        this.loadData();
        select.value = '';
        Swal.fire({
          title: '¡Asignado!',
          text: 'El rol ha sido asignado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  onRemoveRole(userId: string, roleName: string): void {
    const roleObj = this.roles().find(r => r.name === roleName);
    if (!roleObj) return;

    Swal.fire({
      title: '¿Retirar rol?',
      text: `¿Estás seguro de que deseas retirar el rol "${roleName}" de este usuario?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#150fbd',
      cancelButtonColor: '#ff4444',
      confirmButtonText: 'Sí, retirar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usersService.removeRole(userId, roleObj.id).subscribe({
          next: () => {
            this.loadData();
            Swal.fire({
              title: '¡Retirado!',
              text: 'El rol ha sido retirado correctamente.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

  onDeleteUser(userId: string): void {
    const user = this.users().find(u => u.id === userId);
    if (user?.roles?.length) {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'No se puede eliminar un usuario que tiene roles asignados. Por favor, retira todos los roles antes de intentar eliminarlo.',
        icon: 'error',
        confirmButtonColor: '#150fbd',
        confirmButtonText: 'Entendido',
        background: '#ffffff'
      });
      return;
    }

    Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ff4444',
      cancelButtonColor: '#150fbd',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usersService.deleteUser(userId).subscribe({
          next: () => {
            this.loadData();
            Swal.fire({
              title: '¡Eliminado!',
              text: 'El usuario ha sido eliminado correctamente.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
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
        title: 'Acceso Denegado',
        text: 'No se puede inactivar al usuario si tiene roles asignados. Por favor, retira todos los roles antes de inactivarlo.',
        icon: 'error',
        confirmButtonColor: '#150fbd',
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
      confirmButtonColor: '#150fbd',
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
        }).subscribe({
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
}
