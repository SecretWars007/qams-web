import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogsService } from '../../../core/services/catalogs.service';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs';

interface CatalogConfig {
  name: string;
  displayName: string;
  icon: string;
}

/**
 * Componente para administración de catálogos del sistema.
 * Permite visualizar, crear y editar opciones de configuración (estados, prioridades, tipos).
 */
@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.scss']
})
export class CatalogsComponent implements OnInit {
  private catalogsService = inject(CatalogsService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastService);

  /** Lista de catálogos disponibles conforme al backend */
  availableCatalogs: CatalogConfig[] = [
    { name: 'ProjectStatus', displayName: 'Estados de Proyecto', icon: 'ri-folder-info-line' },
    { name: 'TestCasePriority', displayName: 'Prioridades de Casos', icon: 'ri-flag-line' },
    { name: 'ExecutionStatus', displayName: 'Estados de Ejecución', icon: 'ri-play-circle-line' },
    { name: 'TestSuiteStatus', displayName: 'Estados de Suites', icon: 'ri-stack-line' },
    { name: 'StepResultStatus', displayName: 'Estados de Pasos', icon: 'ri-check-double-line' },
    { name: 'TestType', displayName: 'Tipos de Prueba', icon: 'ri-test-tube-line' },
    { name: 'TaskPriority', displayName: 'Prioridades de Tareas', icon: 'ri-alert-line' },
    { name: 'EvidenceType', displayName: 'Tipos de Evidencia', icon: 'ri-attachment-line' }
  ];

  selectedCatalog: CatalogConfig = this.availableCatalogs[0];
  items: any[] = [];
  loading = false;
  showModal = false;
  isEdit = false;
  currentItemId?: number;
  itemForm: FormGroup;

  constructor() {
    this.itemForm = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      isActive: [true],
      sortOrder: [0]
    });
  }

  ngOnInit(): void {
    this.loadCatalogItems();
  }

  /**
   * Selecciona un catálogo para visualizar sus elementos.
   * @param catalog - Configuración del catálogo seleccionado
   */
  selectCatalog(catalog: CatalogConfig): void {
    if (this.selectedCatalog.name === catalog.name) return;
    this.selectedCatalog = catalog;
    this.loadCatalogItems();
  }

  /** Carga los elementos del catálogo seleccionado desde el backend */
  loadCatalogItems(): void {
    this.loading = true;
    this.catalogsService.getAll(this.selectedCatalog.name)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => this.items = data,
        error: (err) => this.toastr.error('Error al cargar elementos del catálogo')
      });
  }

  /** Abre el modal para agregar un nuevo elemento al catálogo actual */
  openAddModal(): void {
    this.isEdit = false;
    this.currentItemId = undefined;
    this.itemForm.reset({ isActive: true });
    this.showModal = true;
  }

  /**
   * Abre el modal para editar un elemento existente.
   * @param item - Elemento a editar
   */
  openEditModal(item: any): void {
    this.isEdit = true;
    this.currentItemId = item.id;
    this.itemForm.patchValue({
      code: item.code,
      name: item.name,
      description: item.description,
      isActive: item.isActive,
      sortOrder: item.sortOrder || 0
    });
    this.showModal = true;
  }

  /** Cierra el modal form */
  closeModal(): void {
    this.showModal = false;
  }

  /** Valida y envía el formulario para crear o actualizar un elemento */
  saveItem(): void {
    if (this.itemForm.invalid) return;

    const itemData = this.itemForm.value;
    const request = this.isEdit && this.currentItemId
      ? this.catalogsService.updateItem(this.selectedCatalog.name, this.currentItemId, itemData)
      : this.catalogsService.createItem(this.selectedCatalog.name, itemData);

    this.loading = true;
    request.pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.toastr.success(`Elemento ${this.isEdit ? 'actualizado' : 'creado'} correctamente`);
          this.loadCatalogItems();
          this.closeModal();
        },
        error: (err) => this.toastr.error('Error al guardar el elemento')
      });
  }

  /**
   * Alterna el estado activo/inactivo de un elemento del catálogo.
   * @param item - Elemento a modificar
   */
  toggleActive(item: any): void {
    const updatedItem = { ...item, isActive: !item.isActive };
    this.catalogsService.updateItem(this.selectedCatalog.name, item.id, updatedItem)
      .subscribe({
        next: () => {
          this.toastr.success('Estado actualizado');
          this.loadCatalogItems();
        },
        error: () => this.toastr.error('Error al actualizar estado')
      });
  }
}

