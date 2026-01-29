import type { 
  ApiIndicator, 
  Indicator, 
  Periodicity, 
  Trend, 
  IndicatorApiPayload,
  ApiFrequency,
  ApiTrend,
  ApiUnit,
  FrequencyOption,
  TrendOption,
  UnitOption,
} from '@/types/indicators';
import { PERIODICITY_CONFIG } from '@/types/indicators';

const mapFrequencyToEnum = (freNombreFrecuencia: string): Periodicity => {
  const map: Record<string, Periodicity> = {
    'Mensual': 'MENSUAL',
    'Bimestral': 'BIMESTRAL',
    'Trimestral': 'TRIMESTRAL',
    'Cuatrimestral': 'CUATRIMESTRAL',
    'Semestral': 'SEMESTRAL',
    'Anual': 'ANUAL',
  };
  return map[freNombreFrecuencia] ?? 'MENSUAL';
};

const mapTrendToEnum = (tenNomTendencia: string): Trend => {
  return tenNomTendencia === 'Ascendente' ? 'ASC' : 'DESC';
};

export const mapApiIndicatorToFrontend = (api: ApiIndicator): Indicator => ({
  id: String(api.indId),
  name: api.indNombre,
  formula: api.indFormula,
  unit: api.fkUnidadMedida?.undNombreUnidad ?? '',
  annualTarget: parseFloat(api.indMetaAnual) || 0,
  periodicity: mapFrequencyToEnum(api.fkFrecuencia?.freNombreFrecuencia ?? ''),
  trend: mapTrendToEnum(api.fkTendencia?.tenNomTendencia ?? ''),
  realValue: api.indValorReal ?? 0,
  active: api.indEstado,
  responsible: api.indResponsable,
  process: api.fkProceso?.nombre,
  processId: api.fkProceso?.idProceso ? String(api.fkProceso.idProceso) : undefined,
  userId: api.fkCreadoPor?.idUsuario,
  variables: [
    {
      id: 'v1',
      key: api.indVariable_1,
      label: api.indExplicacionVar1 ?? api.indVariable_1,
      description: api.indExplicacionVar1 ?? undefined,
    },
    {
      id: 'v2',
      key: api.indVariable_2,
      label: api.indExplicacionVar2 ?? api.indVariable_2,
      description: api.indExplicacionVar2 ?? undefined,
    },
  ],
});

// Mapper options for frontend to API conversion
export interface MapToApiOptions {
  unitId: number;
  frequencyId: number;
  trendId: number;
  processId: number;
}

// Convert frontend Indicator to API payload
export const mapFrontendToApiPayload = (
  indicator: Omit<Indicator, 'id' | 'active' | 'process' | 'processId' | 'userId'>,
  options: MapToApiOptions
): IndicatorApiPayload => ({
  indNombre: indicator.name,
  indFormula: indicator.formula,
  indVariable_1: indicator.variables[0]?.key ?? '',
  indVariable_2: indicator.variables[1]?.key ?? '',
  indExplicacionVar1: indicator.variables[0]?.description || indicator.variables[0]?.label,
  indExplicacionVar2: indicator.variables[1]?.description || indicator.variables[1]?.label,
  indMetaAnual: String(indicator.annualTarget),
  indValorReal: indicator.realValue,
  indResponsable: indicator.responsible ?? '',
  fkUnidadMedida: options.unitId,
  fkFrecuencia: options.frequencyId,
  fkTendencia: options.trendId,
  fkProceso: options.processId,
});

// Map API frequency to frontend option
export const mapApiFrequencyToOption = (api: ApiFrequency): FrequencyOption => {
  const periodicityConfig = PERIODICITY_CONFIG.find(
    p => p.label === api.freNombreFrecuencia
  );
  return {
    id: api.freId,
    name: api.freNombreFrecuencia,
    periods: periodicityConfig?.periods ?? 1,
  };
};

// Map API trend to frontend option
export const mapApiTrendToOption = (api: ApiTrend): TrendOption => ({
  id: api.tenId,
  name: api.tenNomTendencia,
});

// Map API unit to frontend option
export const mapApiUnitToOption = (api: ApiUnit): UnitOption => ({
  id: api.undId,
  name: api.undNombreUnidad,
});
