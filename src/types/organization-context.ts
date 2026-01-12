export interface ApiContextType {
  id: number;
  contexto: string;
  activo: boolean;
}

export interface ContextType {
  id: number;
  name: string;
  active: boolean;
}

export interface ApiContextMatrix {
  ctxId: number;
  ctxDescripcion: string;
  linkDocumento: string;
  ctxEstado: boolean;
  ctxActivo: boolean;
  ctxVigencia: string;
  ctxCreadoEl: Date;
  ctxTipo: ApiContextType;
}

export interface ContextMatrix {
  id: number;
  description: string;
  document: string;
  status: boolean;
  active: boolean;
  fiscalYear: string;
  createdAt: Date;
  type: ContextType;
}

export interface CreateContextMatrixPayload {
  description: string;
  document: File;
  type: number;
}
