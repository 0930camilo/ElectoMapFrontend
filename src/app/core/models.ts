export type Role = 'ADMIN' | 'LIDER';

export interface SessionUser {
  id: number;
  username: string;
  rol: Role;
}

export interface ProfileUpdateRequest {
  nombres: string;
  apellidos: string;
  username: string;
  email: string | null;
  telefono: string | null;
  nuevaClave: string | null;
}

export interface ProfileResponse {
  nombres: string;
  apellidos: string;
  username: string;
  email: string | null;
  telefono: string | null;
  rol: Role;
}

export interface OcrCensoResult {
  numeroDocumento: string | null;
  departamentoVotacion: string | null;
  municipioVotacion: string | null;
  puestoVotacion: string | null;
  direccion: string | null;
  mesaVotacion: string | null;
  textoDetectado: string;
  confianza: number;
}

export interface LoginResult {
  token: string;
  type: string;
  user: SessionUser;
}

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

export interface DashboardSummary {
  totalCabeceras?: number;
  totalLideres?: number;
  totalVotantes: number;
  registrosHoy: number;
  registrosSemana: number;
  registrosMes: number;
  porEstado: { estado: string; total: number }[];
  porCabecera?: { id: number; nombre: string; total: number }[];
  porLider?: { id: number; nombre: string; total: number }[];
  liderNombre?: string;
  cabeceraNombre?: string;
}

export interface Cabecera {
  id: number;
  nombre: string;
  descripcion?: string;
  zona?: string;
  estado: string;
  administradorUsername?: string;
  lideresAsignados?: number;
  cantidadVotantes?: number;
}

export interface Leader {
  id: number;
  usuarioId?: number;
  username: string;
  nombres: string;
  apellidos: string;
  documento: string;
  telefono?: string;
  email?: string;
  cabeceraId: number;
  cabeceraNombre?: string;
  estado: string;
}

export interface Voter {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  departamentoVotacion?: string;
  municipioVotacion?: string;
  puestoVotacion?: string;
  direccion?: string;
  barrio?: string;
  mesaVotacion: string;
  estado: string;
  observaciones?: string;
  liderId?: number;
  liderNombre?: string;
  cabeceraId?: number;
  cabeceraNombre?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface AssignmentHistory {
  liderAnterior: string;
  liderNuevo: string;
  motivo: string;
  fecha: string;
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

export interface ImportValidation {
  totalFilas: number;
  filasValidas?: number;
  filasRechazadas?: number;
  importados?: number;
  rechazados?: number;
  errores: { fila: number; mensaje: string }[];
}
