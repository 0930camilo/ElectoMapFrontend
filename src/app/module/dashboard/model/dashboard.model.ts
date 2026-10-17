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
