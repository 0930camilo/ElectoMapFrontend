import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/services/api-client.service';
import { LoginResult, ProfileResponse, ProfileUpdateRequest } from '../model/auth.model';

/** Auth/profile API: POST /api/auth/login and PUT /api/perfil/me. */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiClientService);

  login(username: string, password: string): Observable<LoginResult> {
    return this.api.request('/api/auth/login', 'POST', { username, password });
  }

  updateProfile(value: ProfileUpdateRequest): Observable<ProfileResponse> {
    return this.api.request('/api/perfil/me', 'PUT', value);
  }
}
