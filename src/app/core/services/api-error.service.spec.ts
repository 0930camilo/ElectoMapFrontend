import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorService } from './api-error.service';

describe('ApiErrorService', () => {
  const service = new ApiErrorService();

  it('explains the login lockout and retry duration', () => {
    const error = new HttpErrorResponse({
      status: 429,
      error: {
        success: false,
        message: 'Demasiados intentos. Intente nuevamente más tarde.',
        data: {
          remainingAttempts: 0,
          retryAfterTotalSeconds: 883,
          retryAfterMinutes: 14,
          retryAfterSeconds: 43,
        },
      },
    });

    expect(service.message(error, 'login')).toBe(
      'Acceso temporalmente bloqueado por demasiados intentos. Intenta nuevamente en 14 min 43 s. Intentos restantes: 0.',
    );
  });

  it('does not describe invalid login credentials as an expired session', () => {
    const error = new HttpErrorResponse({
      status: 401,
      error: { message: 'Credenciales inválidas.' },
    });

    expect(service.message(error, 'login')).toBe('Credenciales inválidas.');
    expect(service.message(error)).toBe('Tu sesión expiró. Inicia sesión nuevamente.');
  });
});
