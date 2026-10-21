import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/services/api-client.service';
import { ImportValidation } from '../model/import.model';

/** Imports API: file validation, import execution, and downloadable error report. */
@Injectable({ providedIn: 'root' })
export class ImportacionService {
  private readonly api = inject(ApiClientService);

  downloadTemplate(): Observable<Blob> {
    return this.api.getBlob('/api/votantes/importaciones/plantilla');
  }

  validate(file: File, liderId?: number): Observable<ImportValidation> {
    const form = new FormData();
    form.append('archivo', file);
    if (liderId !== undefined) form.append('liderId', String(liderId));
    return this.api.request('/api/votantes/importaciones/validar', 'POST', form);
  }

  execute(file: File, liderId?: number): Observable<ImportValidation> {
    const form = new FormData();
    form.append('archivo', file);
    if (liderId !== undefined) form.append('liderId', String(liderId));
    return this.api.request('/api/votantes/importaciones', 'POST', form);
  }

  downloadErrorReport(file: File, liderId?: number): Observable<Blob> {
    const form = new FormData();
    form.append('archivo', file);
    if (liderId !== undefined) form.append('liderId', String(liderId));
    return this.api.blob('/api/votantes/importaciones/reporte-errores', form);
  }
}
