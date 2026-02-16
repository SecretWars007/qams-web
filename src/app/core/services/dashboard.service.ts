// src/app/core/services/dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardSummary } from '../models/dashboard.model';
import { DashboardMockService } from './dashboard.mock.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private mockService = inject(DashboardMockService);

    getSummary(): Observable<DashboardSummary> {
        return this.mockService.getSummary();
    }
}
