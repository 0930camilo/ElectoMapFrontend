import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const isLoginRequest = request.url.endsWith('/api/auth/login');
  const outgoing = token && !isLoginRequest
    ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } })
    : request;

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) auth.clearSession();
      return throwError(() => error);
    }),
  );
};
