import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolesService } from '../../../core/services/roles.service';
import { Role, Permission } from '../../../core/models/role.model';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  private rolesService = inject(RolesService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastService);

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
          this.toastr.error('Error al cargar la lista de roles');
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
        this.toastr.success(`Rol ${this.isEdit() ? 'actualizado' : 'creado'} correctamente`);
        this.closeModels();
        this.loadRoles();
      },
      error: (err) => {
        console.error('[RolesComponent] Save error', err);
        this.toastr.error('Error al guardar el rol');
      }
    });
  }

  /** Toggles active/inactive status of a role */
  toggleStatus(role: Role): void {
    if (role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'administrador') {
         this.toastr.warning('El rol principal de administrador no se puede desactivar.');
         return;
    }
    this.rolesService.toggleRoleStatus(role.id).subscribe({
      next: () => {
        this.toastr.success(`Rol ${role.isActive ? 'desactivado' : 'activado'} correctamente`);
        this.loadRoles();
      },
      error: (err) => {
        console.error('[RolesComponent] Status toggle error', err);
        this.toastr.error('Error al cambiar el estado del rol');
      }
    });
  }

  /** Duplicates a role */
  duplicateRole(role: Role): void {
    if (confirm(`¿Estás seguro de duplicar el rol "${role.name}"?`)) {
      this.rolesService.duplicateRole(role.id).subscribe({
        next: () => {
          this.toastr.success('Rol duplicado correctamente');
          this.loadRoles();
        },
        error: (err) => {
          console.error('[RolesComponent] Duplicate error', err);
          this.toastr.error('Error al duplicar el rol');
        }
      });
    }
  }

  /** Deletes a role */
  deleteRole(role: Role): void {
    if (confirm(`¿Estás seguro de eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`)) {
      this.rolesService.deleteRole(role.id).subscribe({
        next: () => {
          this.toastr.success('Rol eliminado correctamente');
          this.loadRoles();
        },
        error: (err) => {
          console.error('[RolesComponent] Delete error', err);
          this.toastr.error('Error al eliminar el rol');
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
          const parts = p.name ? p.name.split('_') : p.code ? p.code.split('_') : ['GENERAL'];
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
    if (!role || !role.permissions) return false;
    
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
        this.toastr.success(`Permiso ${isChecked ? 'añadido' : 'removido'} correctamente`);
      },
      error: (err) => {
        console.error('[RolesComponent] Permission toggle error', err);
        // Revert toggle
        (event.target as HTMLInputElement).checked = !isChecked;
        this.toastr.error('Error al actualizar permiso');
      }
    });
  }
}
