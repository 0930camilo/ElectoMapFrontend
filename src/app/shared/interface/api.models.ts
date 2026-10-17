export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AuditEntry {
  id: number;
  usuarioId: number;
  username: string;
  accion: string;
  entidad: string;
  entidadId: number;
  descripcion: string;
  fecha: string;
  ip: string;
}
