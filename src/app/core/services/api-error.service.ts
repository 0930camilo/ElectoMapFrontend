import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  message(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      const responseMessage = body && typeof body === 'object' && 'message' in body
        && typeof body.message === 'string'
        ? body.message
        : null;
      if (error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
      if (error.status === 403) return 'No tienes permisos para realizar esta acción.';
      return responseMessage || error.message || 'No se pudo conectar con el servidor.';
    }
    if (error instanceof Error) return error.message;
    return 'Ocurrió un error inesperado.';
  }
}
