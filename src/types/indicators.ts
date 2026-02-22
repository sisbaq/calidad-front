export type Periodicity =
  | 'MENSUAL'
  | 'BIMESTRAL'
  | 'TRIMESTRAL'
  | 'CUATRIMESTRAL'
  | 'SEMESTRAL'
  | 'ANUAL';

export type Trend = 'ASC' | 'DESC';

export interface IndicatorVariable {
  id: string;
  key: string;
  label: string;
  description?: string;
}

export interface IndicatorPeriodRow {
  index: number;
  label: string;
  meta: number | null;
  values: Record<string, string>;
  result?: number;
  realValue?: string;
  compliance?: string;
  managementDate?: string;
  possibleDate?: string;
  observation: string;
  evidence: File | null;
  sent?: boolean;
}

export interface IndicatorPeriodSummary {
  period?: string;
  sent?: boolean;
}


export interface Indicator {
  id: string;
  name: string;
  formula: string;
  unit: string;
  annualTarget: number;
  tolerance?: number;
  periodicity: Periodicity;
  trend: Trend;
  realValue?: number;
  active: boolean;
  processId?: string;
  responsible?: string;
  variables: IndicatorVariable[];
  process?: string;
  userId?: number;
  periods?: IndicatorPeriodSummary[];
}

export interface ApiIndicator {
  indId: number;
  indNombre: string;
  indFormula: string;
  indMetaAnual: string;
  indResponsable: string;
  indCreadoEl: string;
  indEstado: boolean;
  indEstadoRegistro: boolean;
  indTolerancia?: number | null;
  fkUnidadMedida: { undId: number; undNombreUnidad: string } | null;
  fkCreadoPor: { idUsuario: number; nombreCompleto: string } | null;
  fkFrecuencia: { freId: number; freNombreFrecuencia: string } | null;
  fkTendencia: { tenId: number; tenNomTendencia: string } | null;
  fkProceso: { idProceso: number; nombre: string } | null;
  fkEstadoGestion?: { estId: number; estNombre: string } | null;
}

export interface ApiIndicatorResult {
  rdiId: number;
  rdiValorReal: string; // numeric type from PostgreSQL comes as string
  rdiObservacion: string | null;
  rdiVigencia: number;
  rdiCreadoEl: string;
  rdiMetaAcumulada: string; // numeric type from PostgreSQL comes as string
  fkGestionadoPor?: { idUsuario: number; nombreCompleto: string };
  fkIndicador?: { indId: number; indNombre: string };
}

export interface IndicatorResult {
  id: number;
  realValue: number;
  observation: string | null;
  fiscalYear: number;
  createdAt: string;
  accumulatedTarget: number;
  managedBy?: { id: number; name: string };
  indicator?: { id: number; name: string };
}


export interface PeriodicityOption {
  value: Periodicity;
  label: string;
  periods: number;
}


export const PERIODICITY_CONFIG: PeriodicityOption[] = [
  { value: 'MENSUAL', label: 'Mensual', periods: 12 },
  { value: 'BIMESTRAL', label: 'Bimestral', periods: 6 },
  { value: 'TRIMESTRAL', label: 'Trimestral', periods: 4 },
  { value: 'CUATRIMESTRAL', label: 'Cuatrimestral', periods: 3 },
  { value: 'SEMESTRAL', label: 'Semestral', periods: 2 },
  { value: 'ANUAL', label: 'Anual', periods: 1 },
];



export const TREND_OPTIONS = [
  { value: 'ASC', label: 'Ascendente' },
  { value: 'DESC', label: 'Descendente' },
];



export const createId = () => crypto.randomUUID();

export const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return String(value);
  return num.toLocaleString('es-CO', { maximumFractionDigits: 2 });
};

export const getPeriodConfig = (periodicity: Periodicity): PeriodicityOption => {
  return (
    PERIODICITY_CONFIG.find((p) => p.value === periodicity) ??
    PERIODICITY_CONFIG[0]
  );
};


export const getPeriodLabel = (periodicity: Periodicity): string => {
  const config = PERIODICITY_CONFIG.find((p) => p.value === periodicity);
  return config?.label ?? 'Mensual';
};



export interface PeriodRow {
  id: string;
  periodLabel: string;
  value: number | null;
  observation?: string;
}

// Maximum number of variables supported by the backend
export const MAX_INDICATOR_VARIABLES = 2;

// API response types for dropdowns
export interface ApiFrequency {
  freId: number;
  freNombreFrecuencia: string;
  freEstado: boolean;
}

export interface ApiTrend {
  tenId: number;
  tenNomTendencia: string;
  tenEstado: boolean;
}

export interface ApiUnit {
  undId: number;
  undNombreUnidad: string;
  undEstado: boolean;
}

// Frontend option types for dropdowns
export interface FrequencyOption {
  id: number;
  name: string;
  periods: number;
}

export interface TrendOption {
  id: number;
  name: string;
}

export interface UnitOption {
  id: number;
  name: string;
}

// Payload type for creating/updating indicators
export interface IndicatorApiPayload {
  indNombre: string;
  indFormula: string;
  indMetaAnual: string;
  indResponsable: string;
  indEstadoRegistro: boolean;
  indTolerancia: number;
  fkUnidadMedida: number;
  fkFrecuencia: number;
  fkTendencia: number;
  fkProceso: number;
}

export interface IndicatorResultPayload {
  rdiValorReal: number;
  rdiObservacion?: string | null;
  rdiVigencia: number;
  fkIndicador: number;
}
