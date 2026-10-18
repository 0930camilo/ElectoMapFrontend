import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/services/api-client.service';
import { Page } from '../../../shared/interface/api.models';
import { Leader } from '../model/leader.model';

/** Leaders API: list/detail/current leader, create/update, and state changes. */
@Injectable({ providedIn: 'root' })
export class LiderService {
  private readonly api = inject(ApiClientService);

  list(page = 0, size = 10): Observable<Page<Leader>> {
    return this.api.get('/api/lideres', { page, size });
  }

  get(id: number): Observable<Leader> {
    return this.api.get(`/api/lideres/${id}`);
  }

  getCurrent(): Observable<Leader> {
    return this.api.get('/api/lideres/me');
  }

  save(value: Record<string, unknown>, id?: number): Observable<Leader> {
    return this.api.request(`/api/lideres${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', value);
  }

  setState(id: number, estado: string): Observable<unknown> {
    return this.api.request(`/api/lideres/${id}/estado`, 'PATCH', { estado });
  }
}
