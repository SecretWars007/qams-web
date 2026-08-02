// src/app/core/services/catalogs.mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CatalogsMockService {
    private catalogs: Record<string, any[]> = {
        'ProjectStatus': [
            { id: 1, name: 'En Planeación', isActive: true },
            { id: 2, name: 'En Ejecución', isActive: true },
            { id: 3, name: 'Finalizado', isActive: true },
            { id: 4, name: 'Cancelado', isActive: true }
        ],
        'TestCasePriority': [
            { id: 1, name: 'Baja', isActive: true },
            { id: 2, name: 'Media', isActive: true },
            { id: 3, name: 'Alta', isActive: true },
            { id: 4, name: 'Crítica', isActive: true }
        ],
        'TestExecutionStatus': [
            { id: 1, name: 'Pendiente', isActive: true },
            { id: 2, name: 'En Progreso', isActive: true },
            { id: 3, name: 'Exitoso', isActive: true },
            { id: 4, name: 'Fallido', isActive: true },
            { id: 5, name: 'Bloqueado', isActive: true }
        ]
    };

    getActive(catalogName: string): Observable<any[]> {
        const items = this.catalogs[catalogName] || [];
        return of(items.filter(i => i.isActive)).pipe(delay(500));
    }

    getAll(catalogName: string): Observable<any[]> {
        const items = this.catalogs[catalogName] || [];
        return of(items).pipe(delay(500));
    }

    createItem(catalogName: string, item: any): Observable<any> {
        if (!this.catalogs[catalogName]) this.catalogs[catalogName] = [];
        const newItem = { ...item, id: this.catalogs[catalogName].length + 1, isActive: true };
        this.catalogs[catalogName].push(newItem);
        return of(newItem).pipe(delay(500));
    }

    updateItem(catalogName: string, id: number, item: any): Observable<any> {
        const index = this.catalogs[catalogName]?.findIndex(i => i.id === id);
        if (index !== -1) {
            this.catalogs[catalogName][index] = { ...this.catalogs[catalogName][index], ...item };
            return of(this.catalogs[catalogName][index]).pipe(delay(500));
        }
        throw new Error('Item not found');
    }
}
