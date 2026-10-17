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
