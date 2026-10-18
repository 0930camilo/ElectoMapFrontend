import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/services/api-client.service';
import { AuditEntry, Page } from '../../../shared/interface/api.models';

/** Audit API: paginated entries with optional filters via HttpParams. */
@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly api = inject(ApiClientService);

  list(page = 0, size = 10, filters: Record<string, string> = {}): Observable<Page<AuditEntry>> {
    return this.api.get('/api/auditoria', { page, size, ...filters });
  }
}
