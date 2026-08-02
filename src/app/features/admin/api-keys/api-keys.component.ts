import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiKeysService } from '../../../core/services/api-keys.service';
import { ApiKey } from '../../../core/models/api-key.model';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { ApiKeyModalComponent } from './api-key-modal/api-key-modal.component';
import { ProjectContextService } from '../../../core/services/project-context.service';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-api-keys',
  standalone: true,
  imports: [CommonModule, FormsModule, ApiKeyModalComponent],
  templateUrl: './api-keys.component.html',
  styleUrls: ['./api-keys.component.scss']
})
export class ApiKeysComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
  private readonly apiKeysService = inject(ApiKeysService);
  private readonly projectContextService = inject(ProjectContextService);

  apiKeys = signal<ApiKey[]>([]);
  loading = signal<boolean>(false);
  
  showModal = signal<boolean>(false);
  
  newApiKeyToken = signal<string | null>(null);

  get currentProjectId(): string | null {
    return this.projectContextService.activeProjectId();
  }

  ngOnInit(): void {
    this.loadApiKeys();
  }

  loadApiKeys(): void {
    const projectId = this.currentProjectId;
    if (!projectId) return;

    this.loading.set(true);
    this.apiKeysService.getByProject(projectId).pipe(
      finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => this.apiKeys.set(data),
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar las API Keys',
          confirmButtonColor: '#150fbd'
        });
      }
    });
  }

  openCreateModal(): void {
    this.newApiKeyToken.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSave(apiKeyData: any): void {
    const projectId = this.currentProjectId;
    if (!projectId) {
      Swal.fire('Error', 'No hay proyecto seleccionado', 'error');
      return;
    }
    apiKeyData.projectId = projectId;

    this.apiKeysService.create(apiKeyData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (createdKey) => {
        // En un escenario real, el backend solo devuelve el token al momento de la creación
        if (createdKey.plainKey) {
          this.newApiKeyToken.set(createdKey.plainKey);
        }
        Swal.fire({
          icon: 'success',
          title: 'API Key Generada',
          text: 'Por favor, copia la API Key ahora. No se volverá a mostrar.',
          confirmButtonColor: '#150fbd'
        });
        this.loadApiKeys();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al generar la API Key',
          confirmButtonColor: '#150fbd'
        });
      }
    });
  }

  revokeApiKey(key: ApiKey): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se revocará el acceso de "${key.name}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#a0aec0',
      confirmButtonText: 'Sí, revocar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiKeysService.revoke(key.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: () => {
            Swal.fire('Revocada', 'La API Key ha sido revocada', 'success');
            this.loadApiKeys();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo revocar la API Key', 'error');
          }
        });
      }
    });
  }
}
