import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';

export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

const LOADER_EXCLUDED_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.context.get(SKIP_GLOBAL_LOADER) || LOADER_EXCLUDED_METHODS.has(request.method)) {
    return next(request);
  }

  return inject(LoadingService).track(next(request));
};
