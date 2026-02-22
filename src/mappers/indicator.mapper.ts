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
  ApiIndicatorResult,
  IndicatorResult,
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

// Export for converting frequency name to enum
export const frequencyNameToEnum = (freNombreFrecuencia: string): Periodicity => {
  return mapFrequencyToEnum(freNombreFrecuencia);
};

// Inverse mapping: convert enum value back to frequency name
export const mapEnumToFrequencyName = (periodicity: Periodicity): string => {
  const map: Record<Periodicity, string> = {
    'MENSUAL': 'Mensual',
    'BIMESTRAL': 'Bimestral',
    'TRIMESTRAL': 'Trimestral',
    'CUATRIMESTRAL': 'Cuatrimestral',
    'SEMESTRAL': 'Semestral',
    'ANUAL': 'Anual',
  };
  return map[periodicity] ?? 'Mensual';
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
  tolerance: api.indTolerancia ? Number(api.indTolerancia) : undefined,
  periodicity: mapFrequencyToEnum(api.fkFrecuencia?.freNombreFrecuencia ?? ''),
  trend: mapTrendToEnum(api.fkTendencia?.tenNomTendencia ?? ''),
  active: api.indEstado,
  responsible: api.indResponsable,
  process: api.fkProceso?.nombre,
  processId: api.fkProceso?.idProceso ? String(api.fkProceso.idProceso) : undefined,
  userId: api.fkCreadoPor?.idUsuario,
  variables: [],
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
  indMetaAnual: String(indicator.annualTarget),
  indResponsable: indicator.responsible ?? '',
  indEstadoRegistro: true,
  indTolerancia: indicator.tolerance ?? 0,
  fkUnidadMedida: options.unitId,
  fkFrecuencia: options.frequencyId,
  fkTendencia: options.trendId,
  fkProceso: options.processId,
});

// Map API frequency to frontend option
export const mapApiFrequencyToOption = (api: ApiFrequency): FrequencyOption => {
  const periodicityConfig = PERIODICITY_CONFIG.find(
    (p) => p.label.toLowerCase() === api.freNombreFrecuencia.toLowerCase()
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

// Map API indicator result to frontend
export const mapApiIndicatorResultToFrontend = (api: ApiIndicatorResult): IndicatorResult => ({
  id: api.rdiId,
  realValue: parseFloat(api.rdiValorReal),
  observation: api.rdiObservacion,
  fiscalYear: api.rdiVigencia,
  createdAt: api.rdiCreadoEl,
  accumulatedTarget: parseFloat(api.rdiMetaAcumulada),
  managedBy: api.fkGestionadoPor
    ? { id: api.fkGestionadoPor.idUsuario, name: api.fkGestionadoPor.nombreCompleto }
    : undefined,
  indicator: api.fkIndicador
    ? { id: api.fkIndicador.indId, name: api.fkIndicador.indNombre }
    : undefined,
});
