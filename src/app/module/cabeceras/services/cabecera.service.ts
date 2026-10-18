import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/services/api-client.service';
import { Page } from '../../../shared/interface/api.models';
import { Cabecera } from '../model/cabecera.model';

/** Cabeceras API: paginated list, detail, create/update, and state changes. */
@Injectable({ providedIn: 'root' })
export class CabeceraService {
  private readonly api = inject(ApiClientService);

  list(page = 0, size = 10, filters: Record<string, string> = {}): Observable<Page<Cabecera>> {
    return this.api.get('/api/cabeceras', { page, size, ...filters });
  }

  get(id: number): Observable<Cabecera> {
    return this.api.get(`/api/cabeceras/${id}`);
  }

  save(value: Partial<Cabecera>, id?: number): Observable<Cabecera> {
    return this.api.request(`/api/cabeceras${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', value);
  }

  setState(id: number, estado: string): Observable<Cabecera> {
    return this.api.request(`/api/cabeceras/${id}/estado`, 'PATCH', { estado });
  }
}
