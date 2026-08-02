import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemsUnderTestService } from '../../core/services/systems-under-test.service';
import { SystemUnderTest } from '../../core/models/system-under-test.model';
import { SystemUnderTestModalComponent } from './system-under-test-modal/system-under-test-modal.component';
import { ProjectContextService } from '../../core/services/project-context.service';
import { AuthService } from '../../core/services/auth.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-systems-under-test',
  standalone: true,
  imports: [CommonModule, FormsModule, SystemUnderTestModalComponent],
  templateUrl: './systems-under-test.component.html',
  styleUrls: ['./systems-under-test.component.scss']
})
export class SystemsUnderTestComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
  private readonly sutService = inject(SystemsUnderTestService);
  private readonly projectContextService = inject(ProjectContextService);
  private readonly authService = inject(AuthService);

  suts = signal<SystemUnderTest[]>([]);
  loading = signal<boolean>(false);
  
  showModal = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  selectedSut = signal<SystemUnderTest | null>(null);

  get currentProjectId(): string | null {
    return this.projectContextService.activeProjectId();
  } 

  canManageSut(): boolean {
    return this.authService.isAdmin() || this.authService.hasPermission('SUT_CREATE'); // Note: QA Lead should have SUT_CREATE, but since we cloned it to everyone earlier, let's explicitly check the role.
  }
  
  hasRequiredRole(): boolean {
      const user = this.authService.currentUser();
      if (!user?.role) return false;
      const roleList = Array.isArray(user.role) ? user.role : [user.role];
      return roleList.some(r => {
          const roleLower = r.toLowerCase().trim();
          return roleLower.includes('admin') || roleLower.includes('qa lead');
      });
  }

  ngOnInit(): void {
    this.loadSuts();
  }

  loadSuts(): void {
    this.loading.set(true);
    this.sutService.getAll().pipe(
      finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data: any[]) => this.suts.set(data),
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los Sistemas Bajo Prueba',
          confirmButtonColor: '#150fbd'
        });
      }
    });
  }

  openCreateModal(): void {
    this.isEdit.set(false);
    this.selectedSut.set(null);
    this.showModal.set(true);
  }

  openEditModal(sut: SystemUnderTest): void {
    this.isEdit.set(true);
    this.selectedSut.set(sut);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSave(sutData: any): void {

    // Validación local de nombre duplicado (UX inmediata)
    const nombreNormalizado = sutData.name?.trim().toLowerCase();
    const currentId = this.selectedSut()?.id;
    const duplicadoLocal = this.suts().some(s =>
      s.name.trim().toLowerCase() === nombreNormalizado &&
      s.id !== currentId
    );

    if (duplicadoLocal) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre duplicado',
        text: `Ya existe un sistema bajo prueba con el nombre "${sutData.name}" en este proyecto.`,
        confirmButtonColor: '#150fbd'
      });
      return;
    }

    const request = this.isEdit() && this.selectedSut()
      ? this.sutService.update(this.selectedSut()!.id, sutData)
      : this.sutService.create(sutData);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `SUT ${this.isEdit() ? 'actualizado' : 'creado'} correctamente`,
          confirmButtonColor: '#150fbd'
        });
        this.closeModal();
        this.loadSuts();
      },
      error: (err) => {
        // 409 Conflict = nombre duplicado detectado por el backend
        const mensaje = err.status === 409 && err.error?.error
          ? err.error.error
          : 'Error al guardar el SUT. Verifique los datos e intente nuevamente.';

        Swal.fire({
          icon: err.status === 409 ? 'warning' : 'error',
          title: err.status === 409 ? 'Nombre duplicado' : 'Error',
          text: mensaje,
          confirmButtonColor: '#150fbd'
        });
      }
    });
  }


  deleteSut(sut: SystemUnderTest): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el SUT "${sut.name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#a0aec0',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.sutService.delete(sut.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El SUT ha sido eliminado', 'success');
            this.loadSuts();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el SUT', 'error');
          }
        });
      }
    });
  }
}
