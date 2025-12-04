export const MONTH_LABELS = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
] as const;

export const PERIODICITY_CONFIG = [
    { value: 'MENSUAL', label: 'Mensual', periods: 12 },
    { value: 'BIMESTRAL', label: 'Bimensual', periods: 6 },
    { value: 'TRIMESTRAL', label: 'Trimestral', periods: 4 },
    { value: 'CUATRIMESTRAL', label: 'Cuatrimestral', periods: 3 },
    { value: 'SEMESTRAL', label: 'Semestral', periods: 2 },
    { value: 'ANUAL', label: 'Anual', periods: 1 },
] as const;

export type Periodicity = (typeof PERIODICITY_CONFIG)[number]['value'];

export const TREND_OPTIONS = [
    { value: 'ASC', label: 'Ascendente' },
    { value: 'DESC', label: 'Descendente' },
] as const;

export type Trend = (typeof TREND_OPTIONS)[number]['value'];

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
    realValue?: number;
    estimatedValue?: number;
    variables: IndicatorVariable[];
    hasData?: boolean;
}

export interface PeriodRow {
    index: number;
    label: string;
    meta: number;
    values: Record<string, string>;
    result?: number;
    observation: string;
    evidence: string;
}

export const createId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getPeriodConfig = (periodicity: Periodicity) =>
    PERIODICITY_CONFIG.find((p) => p.value === periodicity)!;

export const getPeriodLabel = (periodicity: Periodicity, index: number) => {
    switch (periodicity) {
        case 'MENSUAL':
            return MONTH_LABELS[index] ?? `Mes ${index + 1}`;
        case 'BIMESTRAL':
            return `Bimestre ${index + 1}`;
        case 'TRIMESTRAL':
            return `Trimestre ${index + 1}`;
        case 'CUATRIMESTRAL':
            return `Cuatrimestre ${index + 1}`;
        case 'SEMESTRAL':
            return `Semestre ${index + 1}`;
        case 'ANUAL':
        default:
            return 'Año';
    }
};

export const formatNumber = (value?: number, decimals = 2) =>
    typeof value === 'number' && Number.isFinite(value)
        ? value.toFixed(decimals)
        : '-';
