// src/app/core/services/catalogs.service.ts
// Servicio para gestión de catálogos del sistema (estados, prioridades, tipos).
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class CatalogsService {
    /** Prefijo para logs de seguimiento */
    private readonly LOG_TAG = '[CatalogsService]';

    /** URL base del endpoint de catálogos */
    private readonly apiUrl = `${environment.apiUrl}/Catalogs`;

    private readonly http = inject(HttpClient);

    /**
     * Obtiene los ítems activos de un catálogo específico.
     * @param catalogName - Nombre del catálogo (e.g., 'ExecutionStatus')
     */
    getActive(catalogName: string): Observable<any[]> {
        console.log(this.LOG_TAG, 'Obteniendo ítems activos de:', catalogName);
        return this.http.get<any[]>(`${this.apiUrl}/${catalogName}/active`);
    }

    /** Alias de compatibilidad para getActive */
    getActiveByCatalog(catalogName: string): Observable<any[]> {
        return this.getActive(catalogName);
    }

    /**
     * Obtiene todos los ítems (activos e inactivos) de un catálogo.
     * @param catalogName - Nombre del catálogo
     */
    getAllByCatalog(catalogName: string): Observable<any[]> {
        console.log(this.LOG_TAG, 'Obteniendo todos los ítems de:', catalogName);
        return this.http.get<any[]>(`${this.apiUrl}/${catalogName}`);
    }

    /**
     * Crea un nuevo ítem en un catálogo.
     * @param catalogName - Nombre del catálogo
     * @param item - Datos del ítem a crear
     */
    createCatalogItem(catalogName: string, item: any): Observable<any> {
        console.log(this.LOG_TAG, 'Creando ítem en:', catalogName);
        return this.http.post<any>(`${this.apiUrl}/${catalogName}`, item);
    }

    /**
     * Actualiza un ítem existente en un catálogo.
     * @param catalogName - Nombre del catálogo
     * @param id - ID del ítem
     * @param item - Datos actualizados
     */
    updateCatalogItem(catalogName: string, id: number, item: any): Observable<any> {
        console.log(this.LOG_TAG, 'Actualizando ítem', id, 'en:', catalogName);
        return this.http.put<any>(`${this.apiUrl}/${catalogName}/${id}`, item);
    }
}
