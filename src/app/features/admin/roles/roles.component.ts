import Swal from 'sweetalert2';
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolesService } from '../../../core/services/roles.service';
import { Role } from '../../../core/models/role.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  private readonly rolesService = inject(RolesService);
  private readonly fb = inject(FormBuilder);

  roles = signal<Role[]>([]);
  allPermissions = signal<any[]>([]); // System permissions
  loading = signal<boolean>(false);
  
  // Modals state
  showRoleModal = signal<boolean>(false);
  showPermissionsModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  
  // Forms and Selection
  roleForm: FormGroup;
  isEdit = signal<boolean>(false);
  selectedRole = signal<Role | null>(null);

  constructor() {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadAllPermissions();
  }

  /** Gets all roles from backend */
  loadRoles(): void {
    this.loading.set(true);
    this.rolesService.getRoles()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.roles.set(data),
        error: (err) => {
          console.error('[RolesComponent] Error loading roles', err);
          Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al cargar la lista de roles',
      confirmButtonColor: '#150fbd'
    });
        }
      });
  }

  /** Gets all system permissions to display in the editor */
  loadAllPermissions(): void {
    this.rolesService.getAllPermissions().subscribe({
      next: (data) => this.allPermissions.set(data),
      error: (err) => console.error('[RolesComponent] Error loading permissions', err)
    });
  }

  /** Open modal to create a new role */
  openCreateModal(): void {
    this.isEdit.set(false);
    this.selectedRole.set(null);
    this.roleForm.reset();
    this.showRoleModal.set(true);
  }

  /** Open modal to edit a role's basic info */
  openEditModal(role: Role): void {
    this.isEdit.set(true);
    this.selectedRole.set(role);
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });
    this.showRoleModal.set(true);
  }

  /** Open modal to edit a role's permissions */
  openPermissionsModal(role: Role): void {
    this.selectedRole.set(role);
    this.showPermissionsModal.set(true);
  }

  closeModels(): void {
    this.showRoleModal.set(false);
    this.showPermissionsModal.set(false);
    this.selectedRole.set(null);
  }

  /** Save role (Create or Edit) */
  saveRole(): void {
    if (this.roleForm.invalid) return;

    this.isSubmitting.set(true);
    const data = this.roleForm.value;
    const request$ = this.isEdit() && this.selectedRole()
      ? this.rolesService.updateRole(this.selectedRole()!.id, data)
      : this.rolesService.createRole(data);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `Rol ${this.isEdit() ? 'actualizado' : 'creado'} correctamente`,
          confirmButtonColor: '#150fbd'
        });
        this.closeModels();
        this.loadRoles();
      },
      error: (err) => {
        console.error('[RolesComponent] Save error', err);
        Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al guardar el rol',
      confirmButtonColor: '#150fbd'
    });
      }
    });
  }

  /** Toggles active/inactive status of a role */
  toggleStatus(role: Role): void {
    if (role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'administrador') {
         Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'El rol principal de administrador no se puede desactivar.',
      confirmButtonColor: '#150fbd'
    });
         return;
    }
    this.rolesService.toggleRoleStatus(role.id).subscribe({
      next: () => {
        Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Rol ${role.isActive ? 'desactivado' : 'activado'} correctamente`,
      confirmButtonColor: '#150fbd'
    });
        this.loadRoles();
      },
      error: (err) => {
        console.error('[RolesComponent] Status toggle error', err);
        Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al cambiar el estado del rol',
      confirmButtonColor: '#150fbd'
    });
      }
    });
  }

  /** Duplicates a role */
  duplicateRole(role: Role): void {
    if (confirm(`¿Estás seguro de duplicar el rol "${role.name}"?`)) {
      this.rolesService.duplicateRole(role.id).subscribe({
        next: () => {
          Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Rol duplicado correctamente',
      confirmButtonColor: '#150fbd'
    });
          this.loadRoles();
        },
        error: (err) => {
          console.error('[RolesComponent] Duplicate error', err);
          Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al duplicar el rol',
      confirmButtonColor: '#150fbd'
    });
        }
      });
    }
  }

  /** Deletes a role */
  deleteRole(role: Role): void {
    if (confirm(`¿Estás seguro de eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`)) {
      this.rolesService.deleteRole(role.id).subscribe({
        next: () => {
          Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: 'Rol eliminado correctamente',
      confirmButtonColor: '#150fbd'
    });
          this.loadRoles();
        },
        error: (err) => {
          console.error('[RolesComponent] Delete error', err);
          Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al eliminar el rol',
      confirmButtonColor: '#150fbd'
    });
        }
      });
    }
  }

  // ==== FORMATTERS ====
  
  /** Groups permissions by module for the UI editor */
  get groupedPermissions(): { module: string, permissions: any[] }[] {
    const perms = this.allPermissions();
    if (!perms || perms.length === 0) return [];

    const map = new Map<string, any[]>();
    perms.forEach(p => {
      // Si el backend no envía 'module', intentamos inferirlo del nombre ej: PROJECT_VIEW -> PROJECT
      let mod = p.module;
      if (!mod) {
          const parts = (p.name || p.code || 'GENERAL').split('_');
          mod = parts[0] || 'GENERAL';
      }

      if (!map.has(mod)) map.set(mod, []);
      map.get(mod)!.push(p);
    });

    return Array.from(map.entries()).map(([module, permissions]) => ({ module, permissions }));
  }

  /** Checks if a selected role has a specific permission */
  hasPermission(permission: any): boolean {
    const role = this.selectedRole();
    if (!role?.permissions) return false;
    
    // Validar por id, code o name dependiendo del payload de permissions del backend
    return role.permissions.some((p: any) => 
       p.id === permission.id || p.code === permission.name || p.name === permission.name
    );
  }

  /** Handles individual toggle event for a permission checkbox */
  onPermissionToggle(permission: any, event: Event): void {
    const role = this.selectedRole();
    if (!role) return;

    const isChecked = (event.target as HTMLInputElement).checked;
    const request$ = isChecked
      ? this.rolesService.addPermission(role.id, permission.id)
      : this.rolesService.removePermission(role.id, permission.id);

    request$.subscribe({
      next: () => {
        // Optimistic UI update
        if (isChecked) {
          role.permissions.push(permission);
        } else {
          role.permissions = role.permissions.filter((p: any) => p.id !== permission.id);
        }
        Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: `Permiso ${isChecked ? 'añadido' : 'removido'} correctamente`,
      confirmButtonColor: '#150fbd'
    });
      },
      error: (err) => {
        console.error('[RolesComponent] Permission toggle error', err);
        // Revert toggle
        (event.target as HTMLInputElement).checked = !isChecked;
        Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al actualizar permiso',
      confirmButtonColor: '#150fbd'
    });
      }
    });
  }
}
