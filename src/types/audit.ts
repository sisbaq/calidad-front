export interface FileMeta {
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface AuditReport {
  id: number | string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
  desc?: string;
  planId?: number | string;
}

export interface AuditReportWithPlan {
  id: number | string;
  filename: string;
  description: string;
  type: string;
  url: string;
  createdAt: string;
  plan: {
    id: number | string;
    createdAt: string;
    planType: string;
    planLabel: string;
    description: string;
    fileMeta: FileMeta;
  }
}

export interface AuditPlan {
  id: number | string;
  createdAt: string;
  planType: string;
  planLabel: string;
  description: string;
  fileMeta: FileMeta;
  reports: AuditReport[];
}

export interface PlanOption {
  id: number;
  value: string;
  label: string;
  hint: string;
}


export interface Finding {
  id: string;
  auditReportId: string;
  auditReportDescription: string;
  reportedOnDate: string;
  auditedProcess: string;
  auditType: string;
  findingType: string;
  source: string;
  requirementNumeral: string;
  description: string;
  condition: string;
  reportedBy: string;
}

// Backend types for API integration
export interface ApiUser {
  idUsuario: number;
  nombreUsuario: string;
  contacto: string;
  nombreCompleto: string;
  usuEmailContacto: string;
  usuActivo: boolean;
  fechaCreacion: string | null;
  ultimoAcceso: string | null;
}

export interface ApiProcessType {
  tppId: number;
  tppTipoproceso: string;
  estado: boolean;
}

export interface ApiProcess {
  idProceso: number;
  nombre: string;
  descripcion: string | null;
  objetivo: string;
  alcance: string | null;
  estado: boolean;
  codProceso: string | null;
  responsable: ApiUser;
  tipoProceso: ApiProcessType;
}

export interface ApiSource {
  fteId: number;
  fteNombre: string;
  fteEstado: boolean;
}

export interface ApiAuditType {
  tpaId: number;
  tpaNombreTipo: string;
}

export interface FindingTypeOption {
  id: number;
  name: string;
}

export interface ApiAuditReport {
  idInforme: number;
  descripcion: string;
  creadoEn: string;
  linkInforme: string;
  estado: boolean;
  actualizadoEl: string | null;
}

export interface ApiFindingType {
  tphId: number;
  tphNomHallazgo: string;
}

export interface ApiFinding {
  idHallazgo: number;
  descripcionHecho: string;
  creadoEn: string;
  estado: boolean;
  condicion: string | null;
  numeral: string | null;
  actualizadoEl: string | null;
  reportadoEn: string;
  idInformeAuditoria: ApiAuditReport;
  fkFuente: ApiSource | null;
  tipoAuditoria: ApiAuditType;
  tipoHallazgo: ApiFindingType;
  creadoPor: ApiUser;
  reportadoPor: string | null;
  actualizadoPor: ApiUser | null;
  fkIdProceso: ApiProcess;
}

export interface ProcessOption {
  id: number;
  name: string;
  description?: string;
}

export interface SourceOption {
  id: number;
  name: string;
}
