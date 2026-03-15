import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CatalogsMockService } from './catalogs.mock.service';

@Injectable({ providedIn: 'root' })
export class CatalogsService {
    private readonly apiUrl = `${environment.apiUrl}/Catalogs`;
    private http = inject(HttpClient);
    private mock = inject(CatalogsMockService);

    /** Obtiene los ítems activos de un catálogo específico */
    getActive(catalogName: string): Observable<any[]> {
        if (environment.useMock) return this.mock.getActive(catalogName);
        return this.http.get<any[]>(`${this.apiUrl}/${catalogName}/active`);
    }

    /** Obtiene todos los ítems (activos e inactivos) de un catálogo */
    getAll(catalogName: string): Observable<any[]> {
        if (environment.useMock) return this.mock.getAll(catalogName);
        return this.http.get<any[]>(`${this.apiUrl}/${catalogName}`);
    }

    /** Crea un nuevo ítem en un catálogo */
    createItem(catalogName: string, item: any): Observable<any> {
        if (environment.useMock) return this.mock.createItem(catalogName, item);
        return this.http.post<any>(`${this.apiUrl}/${catalogName}`, item);
    }

    /** Actualiza un ítem existente en un catálogo */
    updateItem(catalogName: string, id: number, item: any): Observable<any> {
        if (environment.useMock) return this.mock.updateItem(catalogName, id, item);
        return this.http.put<any>(`${this.apiUrl}/${catalogName}/${id}`, item);
    }
}
