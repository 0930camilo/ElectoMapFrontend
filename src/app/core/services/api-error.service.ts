import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  message(error: unknown, context: 'login' | 'default' = 'default'): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      const response = this.responseBody(body);
      const responseMessage = response?.message;

      if (response?.data) {
        const retrySeconds = this.retrySeconds(response.data);
        if (retrySeconds !== null) {
          const remainingAttempts = response.data['remainingAttempts'];
          const attemptsText = typeof remainingAttempts === 'number'
            ? ` Intentos restantes: ${remainingAttempts}.`
            : '';
          return `Acceso temporalmente bloqueado por demasiados intentos. Intenta nuevamente en ${this.formatDuration(retrySeconds)}.${attemptsText}`;
        }
        const remainingAttempts = response.data['remainingAttempts'];
        if (typeof remainingAttempts === 'number' && remainingAttempts > 0) {
          return `${responseMessage || 'Usuario o contraseña incorrectos.'} Intentos restantes: ${remainingAttempts}.`;
        }
      }

      if (error.status === 401 && context === 'login') {
        return responseMessage || 'Usuario o contraseña incorrectos.';
      }
      if (error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.';
      if (error.status === 403) return 'No tienes permisos para realizar esta acción.';
      if (error.status === 429) return responseMessage || 'Demasiados intentos. Espera antes de volver a intentarlo.';
      if (error.status === 0) return 'No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo nuevamente.';
      return responseMessage || error.message || 'No se pudo completar la solicitud.';
    }
    if (error instanceof Error) return error.message;
    return 'Ocurrió un error inesperado.';
  }

  private responseBody(value: unknown): {
    message?: string;
    data?: Record<string, unknown>;
  } | null {
    if (!value || typeof value !== 'object') return null;
    const message = 'message' in value && typeof value.message === 'string'
      ? value.message
      : undefined;
    const data = 'data' in value && value.data && typeof value.data === 'object'
      ? value.data as Record<string, unknown>
      : undefined;
    return { message, data };
  }

  private retrySeconds(data: Record<string, unknown>): number | null {
    const total = data['retryAfterTotalSeconds'];
    if (typeof total === 'number' && Number.isFinite(total) && total > 0) return total;

    const minutes = data['retryAfterMinutes'];
    const seconds = data['retryAfterSeconds'];
    if (typeof minutes === 'number' && typeof seconds === 'number') {
      const duration = minutes * 60 + seconds;
      return Number.isFinite(duration) && duration > 0 ? duration : null;
    }
    return null;
  }

  private formatDuration(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0 && seconds > 0) return `${minutes} min ${seconds} s`;
    if (minutes > 0) return `${minutes} min`;
    return `${seconds} s`;
  }
}
