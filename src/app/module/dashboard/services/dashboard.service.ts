import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/services/api-client.service';
import { DashboardSummary } from '../model/dashboard.model';

/** Dashboard API: GET /api/dashboard/{admin|lider}. */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiClientService);

  getSummary(role: 'ADMIN' | 'LIDER'): Observable<DashboardSummary> {
    return this.api.get(`/api/dashboard/${role.toLowerCase()}`);
  }
}
