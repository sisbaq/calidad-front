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

export interface Indicator {
  id: string;
  name: string;
  formula: string;
  unit: string;
  annualTarget: number;
  periodicity: Periodicity;
  trend: Trend;
  realValue: number;
  responsible?: string;
  variables: IndicatorVariable[];
  process?: string;
  hasData?: boolean;
  lastUpdate?: string;
  userId?: number;
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
