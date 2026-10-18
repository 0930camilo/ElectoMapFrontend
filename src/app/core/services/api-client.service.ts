import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../../shared/interface/api.models';

type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type QueryParams = Record<string, string | number | boolean | null | undefined>;

const API_BASE_URL = environment.apiUrl.replace(/\/+$/, '');

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);

  get<T>(path: string, query?: QueryParams): Observable<T> {
    return this.http.get<unknown>(this.apiUrl(path), { params: this.params(query) }).pipe(
      map(response => this.unwrap<T>(response)),
    );
  }

  request<T>(path: string, method: HttpMethod, body?: unknown): Observable<T> {
    return this.http.request<unknown>(method, this.apiUrl(path), { body }).pipe(
      map(response => this.unwrap<T>(response)),
    );
  }

  blob(path: string, body: FormData): Observable<Blob> {
    return this.http.post(this.apiUrl(path), body, { responseType: 'blob' });
  }

  private apiUrl(path: string): string {
    const normalizedPath = path.replace(/^\/+/, '');
    return API_BASE_URL ? `${API_BASE_URL}/${normalizedPath}` : `/${normalizedPath}`;
  }

  private params(query?: QueryParams): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== null && value !== undefined && String(value).trim()) {
        params = params.set(key, String(value));
      }
    }
    return params;
  }

  private unwrap<T>(response: unknown): T {
    if (response && typeof response === 'object') {
      if ('success' in response) {
        const envelope = response as ApiEnvelope<T>;
        if (!envelope.success) {
          throw new Error(envelope.message || 'La solicitud no pudo completarse.');
        }
        return envelope.data;
      }
      if ('data' in response) return response.data as T;
    }
    return response as T;
  }
}
