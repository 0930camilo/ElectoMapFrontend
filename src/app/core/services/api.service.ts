import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, Page, AuditEntry } from '../../shared/interface/api.models';
import { Cabecera } from '../../module/cabeceras/model/cabecera.model';
import { DashboardSummary } from '../../module/dashboard/model/dashboard.model';
import { ImportValidation } from '../../module/importaciones/model/import.model';
import { Leader } from '../../module/lideres/model/leader.model';
import { LoginResult, ProfileResponse, ProfileUpdateRequest } from '../../module/auth/model/auth.model';
import { AssignmentHistory, OcrCensoResult, Voter } from '../../module/votantes/model/voter.model';

const API_BASE_URL = environment.apiUrl.replace(/\/+$/, '');

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  login(username: string, password: string): Observable<LoginResult> {
    return this.request<LoginResult>('/api/auth/login', 'POST', { username, password });
  }

  updateProfile(value: ProfileUpdateRequest): Observable<ProfileResponse> {
    return this.request('/api/perfil/me', 'PUT', value);
  }

  dashboard(role: 'ADMIN' | 'LIDER'): Observable<DashboardSummary> {
    return this.get(`/api/dashboard/${role.toLowerCase()}`);
  }

  cabeceras(page = 0, size = 10, filters: Record<string, string> = {}): Observable<Page<Cabecera>> {
    return this.get('/api/cabeceras', { page, size, ...filters });
  }
  cabecera(id: number): Observable<Cabecera> { return this.get(`/api/cabeceras/${id}`); }
  saveCabecera(value: Partial<Cabecera>, id?: number): Observable<Cabecera> {
    return this.request(`/api/cabeceras${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', value);
  }
  setCabeceraState(id: number, estado: string): Observable<Cabecera> {
    return this.request(`/api/cabeceras/${id}/estado`, 'PATCH', { estado });
  }

  lideres(page = 0, size = 10): Observable<Page<Leader>> { return this.get('/api/lideres', { page, size }); }
  lider(id: number): Observable<Leader> { return this.get(`/api/lideres/${id}`); }
  miPerfilLider(): Observable<Leader> { return this.get('/api/lideres/me'); }
  saveLider(value: Record<string, unknown>, id?: number): Observable<Leader> {
    return this.request(`/api/lideres${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', value);
  }
  setLiderState(id: number, estado: string): Observable<unknown> {
    return this.request(`/api/lideres/${id}/estado`, 'PATCH', { estado });
  }

  votantes(page = 0, size = 10, filters: Record<string, string> = {}): Observable<Page<Voter>> {
    return this.get('/api/votantes', { page, size, ...filters });
  }
  votante(id: number): Observable<Voter> { return this.get(`/api/votantes/${id}`); }
  votanteDocumento(documento: string): Observable<Voter> {
    return this.get(`/api/votantes/documento/${encodeURIComponent(documento)}`);
  }
  saveVotante(value: Record<string, unknown>, id?: number): Observable<Voter> {
    return this.request(`/api/votantes${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', value);
  }
  saveVotanteComoAdministrador(liderDocumento: string, votante: Record<string, unknown>): Observable<Voter> {
    return this.request('/api/votantes/administrador', 'POST', { liderDocumento, votante });
  }
  reconocerCenso(imagen: File): Observable<OcrCensoResult> {
    const form = new FormData();
    form.append('imagen', imagen);
    return this.request('/api/votantes/ocr/censo', 'POST', form);
  }
  setVotanteState(id: number, estado: string): Observable<unknown> {
    return this.request(`/api/votantes/${id}/estado`, 'PATCH', { estado });
  }
  historialAsignaciones(id: number): Observable<AssignmentHistory[]> {
    return this.get(`/api/votantes/${id}/historial-asignaciones`);
  }
  asignarLider(id: number, liderDocumento: string, motivo: string): Observable<unknown> {
    return this.request(`/api/votantes/${id}/lider`, 'PUT', { liderDocumento, motivo });
  }
  eliminarVotante(id: number): Observable<unknown> {
    return this.request(`/api/votantes/${id}`, 'DELETE');
  }

  validarImportacion(file: File): Observable<ImportValidation> {
    return this.upload('/api/votantes/importaciones/validar', file);
  }
  importar(file: File, liderId: number): Observable<ImportValidation> {
    const form = new FormData();
    form.append('archivo', file);
    form.append('liderId', String(liderId));
    return this.request('/api/votantes/importaciones', 'POST', form);
  }
  reporteErrores(file: File): Observable<Blob> {
    const form = new FormData();
    form.append('archivo', file);
    return this.http.post(this.apiUrl('/api/votantes/importaciones/reporte-errores'), form, { responseType: 'blob' });
  }

  auditoria(page = 0, size = 10, filters: Record<string, string> = {}): Observable<Page<AuditEntry>> {
    return this.get('/api/auditoria', { page, size, ...filters });
  }

  private upload<T>(path: string, file: File): Observable<T> {
    const form = new FormData();
    form.append('archivo', file);
    return this.request<T>(path, 'POST', form);
  }

  private get<T>(path: string, params?: Record<string, string | number>): Observable<T> {
    return this.http.get<unknown>(this.apiUrl(path), { params: this.params(params) }).pipe(map(response => this.unwrap<T>(response)));
  }

  private request<T>(path: string, method: string, body?: unknown): Observable<T> {
    return this.http.request<unknown>(method, this.apiUrl(path), { body }).pipe(map(response => this.unwrap<T>(response)));
  }

  private apiUrl(path: string): string {
    const normalizedPath = path.replace(/^\/+/, '');
    return API_BASE_URL ? `${API_BASE_URL}/${normalizedPath}` : `/${normalizedPath}`;
  }

  private params(input?: Record<string, string | number>): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(input ?? {})) {
      if (String(value).trim()) params = params.set(key, String(value));
    }
    return params;
  }

  private unwrap<T>(response: unknown): T {
    if (response && typeof response === 'object' && 'success' in response) {
      const envelope = response as ApiEnvelope<T>;
      if (!envelope.success) throw new Error(envelope.message || 'La solicitud no pudo completarse.');
      return envelope.data;
    }
    return response as T;
  }
}
