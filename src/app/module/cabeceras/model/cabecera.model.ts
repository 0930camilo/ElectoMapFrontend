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
