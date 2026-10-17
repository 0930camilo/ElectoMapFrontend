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
