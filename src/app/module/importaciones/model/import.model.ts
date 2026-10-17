export interface ImportValidation {
  totalFilas: number;
  filasValidas?: number;
  filasRechazadas?: number;
  importados?: number;
  rechazados?: number;
  errores: { fila: number; mensaje: string }[];
}
