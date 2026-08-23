import Swal from 'sweetalert2';
import { Component, OnInit, inject, DestroyRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogsService } from '../../../core/services/catalogs.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

export interface CatalogConfig {
  name: string;
  displayName: string;
  icon: string;
  description: string;
}

export interface CatalogModuleGroup {
  moduleId: string;
  moduleName: string;
  icon: string;
  badgeColor: string;
  catalogs: CatalogConfig[];
}

/**
 * Componente para administración de catálogos del sistema agrupados por módulo.
 * Permite visualizar, crear y editar opciones de configuración de todos los módulos.
 */
@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.scss']
})
export class CatalogsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly catalogsService = inject(CatalogsService);
  private readonly fb = inject(FormBuilder);

  /** Módulos y sus respectivos catálogos del sistema */
  readonly moduleGroups: readonly CatalogModuleGroup[] = [
    {
      moduleId: 'planning',
      moduleName: 'Planificación y Proyectos',
      icon: 'ri-folder-settings-line',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      catalogs: [
        { name: 'ProjectStatus', displayName: 'Estados de Proyecto', icon: 'ri-folder-info-line', description: 'Ciclo de vida de los proyectos' },
        { name: 'ProjectPriority', displayName: 'Prioridades de Proyecto', icon: 'ri-flag-2-line', description: 'Nivel de prioridad organizacional' },
        { name: 'PlatformType', displayName: 'Tipos de Plataforma (SUT)', icon: 'ri-server-line', description: 'Web, Mobile, Desktop, API, etc.' },
        { name: 'RequirementStatus', displayName: 'Estados de Requisito', icon: 'ri-checkbox-circle-line', description: 'Flujo de aprobación del alcance' },
        { name: 'RequirementPriority', displayName: 'Prioridades de Requisito', icon: 'ri-alarm-warning-line', description: 'Importancia para el negocio' },
        { name: 'RequirementType', displayName: 'Tipos de Requisito', icon: 'ri-file-list-3-line', description: 'Funcional, No Funcional, Seguridad' },
        { name: 'RequirementComplexity', displayName: 'Complejidad de Requisito', icon: 'ri-puzzle-line', description: 'Baja, Media, Alta, Compleja' }
      ]
    },
    {
      moduleId: 'design',
      moduleName: 'Diseño y Planes de Prueba',
      icon: 'ri-flask-line',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      catalogs: [
        { name: 'TestPlanStatus', displayName: 'Estados de Plan de Prueba', icon: 'ri-draft-line', description: 'Borrador, En Revisión, Aprobado' },
        { name: 'TestPlanType', displayName: 'Tipos de Plan de Prueba', icon: 'ri-folder-shield-line', description: 'Master, Sprint, Regresión' },
        { name: 'TestStrategy', displayName: 'Estrategias de Prueba', icon: 'ri-mind-map', description: 'Estrategias analíticas, sistemáticas' },
        { name: 'TestSuiteStatus', displayName: 'Estados de Escenarios / Suites', icon: 'ri-stack-line', description: 'Activo, Deprecado, En Diseño' },
        { name: 'SuiteAutomationStatus', displayName: 'Automatización de Suites', icon: 'ri-robot-line', description: 'Manual, Automatizado, Mixto' },
        { name: 'TestCasePriority', displayName: 'Prioridades de Casos de Prueba', icon: 'ri-flag-line', description: 'Baja, Media, Alta, Crítica' },
        { name: 'TestType', displayName: 'Tipos de Prueba', icon: 'ri-test-tube-line', description: 'Funcional, No Funcional, Regresión' },
        { name: 'TestLevel', displayName: 'Niveles de Prueba ISTQB', icon: 'ri-git-branch-line', description: 'Unitaria, Integración, Sistema, UAT' },
        { name: 'TestDesignTechnique', displayName: 'Técnicas de Diseño ISTQB', icon: 'ri-magic-line', description: 'Partición de equivalencia, BVA' },
        { name: 'Tag', displayName: 'Etiquetas / Tags', icon: 'ri-price-tag-3-line', description: 'Etiquetado transversal de pruebas' }
      ]
    },
    {
      moduleId: 'execution',
      moduleName: 'Ejecución de Pruebas & Ambientes',
      icon: 'ri-play-circle-line',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      catalogs: [
        { name: 'ExecutionStatus', displayName: 'Estados de Ejecución', icon: 'ri-play-circle-line', description: 'Passed, Failed, Blocked, In Progress' },
        { name: 'StepResultStatus', displayName: 'Estados de Pasos de Prueba', icon: 'ri-check-double-line', description: 'Aprobado, Fallido, Bloqueado, Omitido' },
        { name: 'EvidenceType', displayName: 'Tipos de Evidencia', icon: 'ri-attachment-line', description: 'Captura, Log, Video, Documento' },
        { name: 'TestEnvironment', displayName: 'Ambientes de Prueba', icon: 'ri-global-line', description: 'QA, Staging, UAT, Producción' }
      ]
    },
    {
      moduleId: 'defects',
      moduleName: 'Gestión de Defectos e Incidentes',
      icon: 'ri-bug-line',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      catalogs: [
        { name: 'DefectStatus', displayName: 'Estados de Defectos', icon: 'ri-bug-2-line', description: 'Nuevo, Asignado, Resuelto, Cerrado' },
        { name: 'DefectPriority', displayName: 'Prioridades de Defectos', icon: 'ri-alarm-line', description: 'Baja, Media, Alta, Urgente' },
        { name: 'FindingSeverity', displayName: 'Severidades de Hallazgos/Defectos', icon: 'ri-error-warning-line', description: 'Menor, Mayor, Crítica, Bloqueante' },
        { name: 'FindingStatus', displayName: 'Estados de Hallazgos', icon: 'ri-shield-check-line', description: 'Detectado, En Análisis, Mitigado' },
        { name: 'FindingType', displayName: 'Tipos de Hallazgo', icon: 'ri-search-eye-line', description: 'Defecto, Oportunidad, Riesgo' }
      ]
    },
    {
      moduleId: 'quality_agile',
      moduleName: 'Calidad, Revisiones & Ágil',
      icon: 'ri-shield-check-line',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      catalogs: [
        { name: 'ReviewStatus', displayName: 'Estados de Revisiones Estáticas', icon: 'ri-survey-line', description: 'Planificada, En Curso, Aprobada' },
        { name: 'ReviewType', displayName: 'Tipos de Revisión', icon: 'ri-file-search-line', description: 'Walkthrough, Técnica, Inspección' },
        { name: 'RiskLevel', displayName: 'Niveles de Riesgo RBT', icon: 'ri-fire-line', description: 'Insignificante, Moderado, Crítico' },
        { name: 'TaskPriority', displayName: 'Prioridades de Tareas Kanban', icon: 'ri-alert-line', description: 'Prioridad de tableros ágiles' }
      ]
    }
  ];

  selectedModuleId = signal<string>('planning');
  searchTerm = signal<string>('');
  
  // Todos los catálogos aplanados
  readonly allCatalogs: readonly CatalogConfig[] = this.moduleGroups.flatMap(g => g.catalogs);

  selectedCatalog = signal<CatalogConfig>(this.moduleGroups[0].catalogs[0]);
  items = signal<any[]>([]);
  loading = signal<boolean>(false);
  showModal = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  currentItemId = signal<number | undefined>(undefined);
  itemForm: FormGroup;

  // Catálogos filtrados por módulo seleccionado o término de búsqueda
  filteredCatalogs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (term) {
      return this.allCatalogs.filter(c => 
        c.displayName.toLowerCase().includes(term) || 
        c.name.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }
    const currentGroup = this.moduleGroups.find(g => g.moduleId === this.selectedModuleId());
    return currentGroup ? currentGroup.catalogs : this.moduleGroups[0].catalogs;
  });

  constructor() {
    this.itemForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(30)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      isActive: [true],
      sortOrder: [0]
    });
  }

  ngOnInit(): void {
    this.loadCatalogItems();
  }

  selectModule(moduleId: string): void {
    this.selectedModuleId.set(moduleId);
    const group = this.moduleGroups.find(g => g.moduleId === moduleId);
    if (group && group.catalogs.length > 0) {
      this.selectCatalog(group.catalogs[0]);
    }
  }

  selectCatalog(catalog: CatalogConfig): void {
    if (this.selectedCatalog().name === catalog.name) return;
    this.selectedCatalog.set(catalog);
    this.loadCatalogItems();
  }

  loadCatalogItems(): void {
    this.loading.set(true);
    this.catalogsService.getAllByCatalog(this.selectedCatalog().name)
      .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => this.items.set(data || []),
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar elementos del catálogo desde el servidor.',
            confirmButtonColor: '#10B981'
          });
        }
      });
  }

  openAddModal(): void {
    this.isEdit.set(false);
    this.currentItemId.set(undefined);
    this.itemForm.reset({ isActive: true, sortOrder: this.items().length + 1 });
    this.showModal.set(true);
  }

  openEditModal(item: any): void {
    this.isEdit.set(true);
    this.currentItemId.set(item.id);
    this.itemForm.patchValue({
      code: item.code,
      name: item.name,
      description: item.description,
      isActive: item.isActive,
      sortOrder: item.sortOrder || 0
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveItem(): void {
    if (this.itemForm.invalid) return;

    const itemData = this.itemForm.value;
    const currentId = this.currentItemId();
    const request = this.isEdit() && currentId
      ? this.catalogsService.updateCatalogItem(this.selectedCatalog().name, currentId, itemData)
      : this.catalogsService.createCatalogItem(this.selectedCatalog().name, itemData);

    this.loading.set(true);
    request.pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `Elemento ${this.isEdit() ? 'actualizado' : 'creado'} correctamente en la base de datos.`,
            confirmButtonColor: '#10B981'
          });
          this.loadCatalogItems();
          this.closeModal();
        },
        error: (err: any) => {
          const serverMsg = err?.error?.message || err?.error?.title || (typeof err?.error === 'string' ? err.error : null);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: serverMsg || 'Error al guardar el elemento en el catálogo. Verifica que el código no esté duplicado y cuentes con los permisos necesarios.',
            confirmButtonColor: '#10B981'
          });
        }
      });
  }

  toggleActive(item: any): void {
    const updatedItem = { ...item, isActive: !item.isActive };
    this.catalogsService.updateCatalogItem(this.selectedCatalog().name, item.id, updatedItem)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Estado actualizado',
            confirmButtonColor: '#10B981'
          });
          this.loadCatalogItems();
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al actualizar estado en la base de datos.',
            confirmButtonColor: '#10B981'
          });
        }
      });
  }
}
