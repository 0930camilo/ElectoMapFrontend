import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/services/api-client.service';
import { Page } from '../../../shared/interface/api.models';
import { AssignmentHistory, OcrCensoResult, Voter } from '../model/voter.model';

/** Voters API: search/list, CRUD/state, assignment history, leader assignment, and OCR. */
@Injectable({ providedIn: 'root' })
export class VotanteService {
  private readonly api = inject(ApiClientService);

  list(page = 0, size = 10, filters: Record<string, string> = {}): Observable<Page<Voter>> {
    return this.api.get('/api/votantes', { page, size, ...filters });
  }

  get(id: number): Observable<Voter> {
    return this.api.get(`/api/votantes/${id}`);
  }

  getByDocument(documento: string): Observable<Voter> {
    return this.api.get(`/api/votantes/documento/${encodeURIComponent(documento)}`);
  }

  save(value: Record<string, unknown>, id?: number): Observable<Voter> {
    return this.api.request(`/api/votantes${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', value);
  }

  saveForLeader(liderDocumento: string, votante: Record<string, unknown>): Observable<Voter> {
    return this.api.request('/api/votantes/administrador', 'POST', { liderDocumento, votante });
  }

  recognizeCensus(imagen: File): Observable<OcrCensoResult> {
    const form = new FormData();
    form.append('imagen', imagen);
    return this.api.request('/api/votantes/ocr/censo', 'POST', form);
  }

  setState(id: number, estado: string): Observable<unknown> {
    return this.api.request(`/api/votantes/${id}/estado`, 'PATCH', { estado });
  }

  getAssignmentHistory(id: number): Observable<AssignmentHistory[]> {
    return this.api.get(`/api/votantes/${id}/historial-asignaciones`);
  }

  assignLeader(id: number, liderDocumento: string, motivo: string): Observable<unknown> {
    return this.api.request(`/api/votantes/${id}/lider`, 'PUT', { liderDocumento, motivo });
  }

  delete(id: number): Observable<unknown> {
    return this.api.request(`/api/votantes/${id}`, 'DELETE');
  }
}
