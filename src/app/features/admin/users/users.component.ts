import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../core/services/users.service';
import { RolesService } from '../../../core/services/roles.service';
import { User } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  private rolesService = inject(RolesService);

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

    this.usersService.assignRole(userId, roleId).subscribe({
      next: () => {
        // Recargar para mostrar los nuevos roles
        this.loadData();
        select.value = ''; // Reset select
      }
    });
  }

  onDeleteUser(userId: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.usersService.deleteUser(userId).subscribe({
        next: () => this.loadData()
      });
    }
  }
}
