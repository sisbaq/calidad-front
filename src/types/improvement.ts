/**
 * Types for Improvement Plans (Plan de Mejoramiento) and Activities
 */

// Frontend types
export interface ImprovementPlanActivity {
  id: string | number;
  description: string;
  seguimientoI: string;
  seguimientoII: string;
  seguimientoIII: string;
  seguimientoIV: string;
  seguimientoIEnviado: boolean;
  seguimientoIIEnviado: boolean;
  seguimientoIIIEnviado: boolean;
  seguimientoIVEnviado: boolean;
  seguimientoIComentario?: string;
  seguimientoIIComentario?: string;
  seguimientoIIIComentario?: string;
  seguimientoIVComentario?: string;
  files?: {
    1: FileAttachment | null;
    2: FileAttachment | null;
    3: FileAttachment | null;
    4: FileAttachment | null;
  };
}

export interface FileAttachment {
  name?: string;
  filename?: string;
  size?: number;
  bytes?: number;
  type?: string;
  url?: string;
}

export interface ImprovementPlan {
  id: string | number;
  findingId: string | number;
  causeAnalysis: string;
  startDate: string;
  endDate: string;
  status: number;
  createdAt?: string;
  updatedAt?: string;
  activities?: ImprovementPlanActivity[];
}

// Extended plan with additional display fields for tables
export interface ImprovementPlanWithDetails extends ImprovementPlan {
  processName: string;
  findingDescription: string;
  findingNumeral: string;
  responsibleName: string;
  closingObservation?: string;
}

export interface FindingWithPlan {
  id: string;
  date: string;
  findingType: string;
  auditType: string;
  source: string;
  requirementNumeral: string;
  condition: string;
  description: string;
  reportedBy: string;
  status: string;
  dueDate: string;
  auditedProcess: string;
  causeAnalysis?: string;
  activities?: ImprovementPlanActivity[];
  improvementActivities?: string;
  improvementPlan?: ImprovementPlan;
}

// Backend API types
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

export interface ApiImprovementPlan {
  plmId: number;
  plmAnalisisDeCausa: string;
  plmFechaInicio: string;
  plmFechaFinal: string;
  plmCreadoEn: string;
  plmActualizadoEl: string | null;
  plmEstadoPlan: number;
  observacionCierre: string | null;
  estado: boolean;
  fkIdHallazgo: {
    idHallazgo: number;
    descripcionHecho: string;
    reportadoPor: string;
    numeral: string | null;
    condicion: string | null;
    creadoEn: string;
    estado: boolean;
    actualizadoEl: string | null;
    fkIdProceso: {
      idProceso: number;
      nombre: string;
    };
  };
  fkCreadoPor: ApiUser;
  fkActualizadoPor: ApiUser | null;
  actividades?: ApiImprovementPlanActivity[];
}

export interface ApiImprovementPlanActivity {
  actId: number;
  actNomActividad: string;
  actCreadoEl: string;
  actActualizadoEl: string | null;
  actSeguimiento1: string;
  actSeguimiento2: string;
  actSeguimiento3: string;
  actSeguimiento4: string;
  actAnexoSeguimiento1: string | null;
  actAnexoSeguimiento2: string | null;
  actAnexoSeguimiento3: string | null;
  actAnexoSeguimiento4: string | null;
  actObservSeguimiento1: string | null;
  actObservSeguimiento2: string | null;
  actObservSeguimiento3: string | null;
  actObservSeguimiento4: string | null;
  actEstado: boolean;
  fkCreadoPor: ApiUser;
  fkActualizadoPor: ApiUser | null;
  fkPlanMejoramiento: {
    plmId: number;
  } | ApiImprovementPlan;
}

// Filter types
export interface ImprovementPlanFilters {
  tipo: string;
  estado: string;
  year: string;
}

// Create/Update payload types
export interface CreateImprovementPlanPayload {
  plmAnalisisDeCausa: string;
  fkIdPlanAuditoria?: number;
  plmFechaInicio: string;
  plmFechaFinal: string;
  plmEstadoPlan: number;
  fkIdHallazgo: number;
  actividades?: NestedActivityPayload[] | string[];
}

// Type for nested activity creation (without fkPlanMejoramiento)
export interface NestedActivityPayload {
  actNomActividad: string;
  actSeguimiento1: string;
  actSeguimiento2: string;
  actSeguimiento3: string;
  actSeguimiento4: string;
  actAnexoSeguimiento1: string;
  actAnexoSeguimiento2: string;
  actAnexoSeguimiento3: string;
  actAnexoSeguimiento4: string;
}

export interface CreateActivityPayload {
  actNomActividad: string;
  actSeguimiento1: string;
  actSeguimiento2: string;
  actSeguimiento3: string;
  actSeguimiento4: string;
  fkPlanMejoramiento: number;
  actAnexoSeguimiento1: string;
  actAnexoSeguimiento2: string;
  actAnexoSeguimiento3: string;
  actAnexoSeguimiento4: string;
}

export interface UpdateActivityPayload {
  actNomActividad?: string;
  actSeguimiento1?: string;
  actSeguimiento2?: string;
  actSeguimiento3?: string;
  actSeguimiento4?: string;
  actAnexoSeguimiento1?: string;
  actAnexoSeguimiento2?: string;
  actAnexoSeguimiento3?: string;
  actAnexoSeguimiento4?: string;
  actObservSeguimiento1?: string;
  actObservSeguimiento2?: string;
  actObservSeguimiento3?: string;
  actObservSeguimiento4?: string;
}
