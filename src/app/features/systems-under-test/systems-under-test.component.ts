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

  canCreateSut(): boolean {
    return this.authService.isAdmin() || 
           this.authService.hasPermission('SUT_CREATE') || 
           this.authService.hasRole('qa lead') || 
           this.authService.hasRole('líder de pruebas (lead)') || 
           this.authService.hasRole('lead') || 
           this.authService.hasRole('tester') || 
           this.authService.hasRole('qa tester') ||
           this.authService.hasRole('administrador') ||
           this.authService.hasRole('admin');
  }

  canEditSut(): boolean {
    return this.authService.isAdmin() || 
           this.authService.hasPermission('SUT_UPDATE') || 
           this.authService.hasRole('qa lead') || 
           this.authService.hasRole('líder de pruebas (lead)') || 
           this.authService.hasRole('lead') || 
           this.authService.hasRole('tester') || 
           this.authService.hasRole('qa tester') ||
           this.authService.hasRole('administrador') ||
           this.authService.hasRole('admin');
  }

  canDeleteSut(): boolean {
    return this.authService.isAdmin() || 
           this.authService.hasPermission('SUT_DELETE') || 
           this.authService.hasRole('qa lead') || 
           this.authService.hasRole('líder de pruebas (lead)') || 
           this.authService.hasRole('lead') ||
           this.authService.hasRole('administrador') ||
           this.authService.hasRole('admin');
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
          confirmButtonColor: '#10B981'
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
        confirmButtonColor: '#10B981'
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
          confirmButtonColor: '#10B981'
        });
        this.closeModal();
        this.loadSuts();
      },
      error: (err) => {
        const mensaje = err.error?.message || err.error?.error || (typeof err.error === 'string' ? err.error : 'Error al guardar el SUT. Verifique los datos e intente nuevamente.');

        Swal.fire({
          icon: err.status === 409 ? 'warning' : 'error',
          title: err.status === 409 ? 'Nombre duplicado' : (err.status === 403 ? 'Acceso denegado' : 'Error'),
          text: mensaje,
          confirmButtonColor: '#10B981'
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
