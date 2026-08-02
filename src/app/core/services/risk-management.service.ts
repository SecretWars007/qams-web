import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductRisk } from '../models/risk.model';

@Injectable({ providedIn: 'root' })
export class RiskManagementService {
    private readonly LOG_TAG = '[RiskManagementService]';
    private readonly apiUrl = `${environment.apiUrl}/Risks`;
    private readonly http = inject(HttpClient);

    getRisksByProject(projectId: string): Observable<ProductRisk[]> {
        console.log(this.LOG_TAG, `Obteniendo riesgos para proyecto: ${projectId}`);
        let params = new HttpParams();
        if (projectId) {
            params = params.set('projectId', projectId);
        }
        return this.http.get<ProductRisk[]>(this.apiUrl, { params });
    }
}
