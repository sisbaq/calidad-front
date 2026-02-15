export interface AutoControlActivity {
  ascId: number;
  fkPlanMejoraAutocontrol: number;
  ascDescripcionActividad: string;
  ascCreadoEl: string;
  ascSeguimiento1: string;
  ascSeguimiento2: string;
  ascSeguimiento3: string;
  ascSeguimiento4: string;
  ascAnexoSeguimiento1: string;
  ascAnexoSeguimiento2: string;
  ascAnexoSeguimiento3: string;
  ascAnexoSeguimiento4: string;
  ascObservSeguimiento1: string;
  ascObservSeguimiento2: string;
  ascObservSeguimiento3: string;
  ascObservSeguimiento4: string;
  ascEstado: boolean;
  ascCerrado: boolean;
}

export interface AutoControlPlan {
  pmaId: number;
  fkHallazgoAutocontrol: number;
  pmaAnalisisDeCausa: string;
  pmaFechaProyectada: string;
  pmaCreadoEn: string;
  fkEstadoPlanAuto: number;
  pmaEstado: boolean;
  pmaObservacion: string;
}

export interface AutoControlFinding {
  hacId: number;
  hacDescripcion: string;
  fkProceso: number;
  fkTipoAutocontrol: number;
  fkOrigen: number;
  fkCreadoPor: number;
  hacReportadoPor: string;
  hacCreado: string;
  hacNormaNumeral: string;
  hacEstado: boolean;
}

export interface AutoControlRecord {
  finding: AutoControlFinding;
  plan: AutoControlPlan;
  activities: AutoControlActivity[];
}

export interface AutoControlOption {
  id: number;
  name: string;
}
