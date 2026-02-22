import { axiosInstance } from '@/api/axiosInstance';
import type { 
  Indicator, 
  IndicatorApiPayload,
  IndicatorResultPayload,
  ApiFrequency,
  ApiTrend,
  ApiUnit,
  FrequencyOption,
  TrendOption,
  UnitOption,
  IndicatorResult,
} from '@/types/indicators';
import { 
  mapApiIndicatorToFrontend,
  mapApiFrequencyToOption,
  mapApiTrendToOption,
  mapApiUnitToOption,
  mapApiIndicatorResultToFrontend,
} from '@/mappers/indicator.mapper';

// In-memory cache for dropdown options
let frequenciesCache: FrequencyOption[] | null = null;
let trendsCache: TrendOption[] | null = null;
let unitsCache: UnitOption[] | null = null;

export const getIndicators = async (): Promise<Indicator[]> => {
  try {
    const { data } = await axiosInstance.get('/get/sigIndicador');

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format');
    }

    const indicators = data.map(mapApiIndicatorToFrontend);

    // Obtener resultados de indicadores para marcar cuáles tienen seguimientos
    try {
      const results = await getIndicatorResults();
      
      // Crear un mapa de indicadores con sus períodos enviados
      const indicatorResultsMap = new Map<string, Set<number>>();
      results.forEach((result) => {
        const indicatorId = String(result.indicator?.id);
        if (!indicatorResultsMap.has(indicatorId)) {
          indicatorResultsMap.set(indicatorId, new Set());
        }
        indicatorResultsMap.get(indicatorId)?.add(result.fiscalYear);
      });

      // Adjuntar información de períodos a cada indicador
      indicators.forEach((indicator) => {
        const sentPeriods = indicatorResultsMap.get(indicator.id);
        if (sentPeriods && sentPeriods.size > 0) {
          indicator.periods = Array.from(sentPeriods).map((periodNum) => ({
            period: String(periodNum),
            sent: true,
          }));
        } else {
          indicator.periods = [];
        }
      });
    } catch (err) {
      console.warn('Failed to fetch indicator results, continuing without tracking info:', err);
      // Si falla la carga de resultados, continuar sin información de seguimiento
      indicators.forEach((indicator) => {
        indicator.periods = [];
      });
    }

    return indicators;
  } catch (error) {
    console.error('Failed to fetch indicators:', error);
    throw new Error('No se pudieron obtener los indicadores.');
  }
};

export const createIndicator = async (payload: IndicatorApiPayload): Promise<Indicator> => {
  try {
    const { data } = await axiosInstance.post('/crear/sigIndicador', payload);
    return mapApiIndicatorToFrontend(data);
  } catch (error) {
    console.error('Failed to create indicator:', error);
    throw new Error('No se pudo crear el indicador.');
  }
};

export const updateIndicator = async (id: string | number, payload: Partial<IndicatorApiPayload>): Promise<void> => {
  try {
    await axiosInstance.put(`/editar/sigIndicador/${id}`, payload);
  } catch (error) {
    console.error('Failed to update indicator:', error);
    throw new Error('No se pudo actualizar el indicador.');
  }
};

export const deleteIndicator = async (id: string | number): Promise<void> => {
  try {
    await axiosInstance.delete(`/delete/sigIndicador/${id}`);
  } catch (error) {
    console.error('Failed to delete indicator:', error);
    throw new Error('No se pudo eliminar el indicador.');
  }
};

export const createIndicatorResult = async (
  payload: IndicatorResultPayload,
): Promise<void> => {
  try {
    await axiosInstance.post('/crear/resultadoIndicador', payload);
  } catch (error) {
    console.error('Failed to create indicator result:', error);
    throw new Error('No se pudo enviar el seguimiento del indicador.');
  }
};

export const getIndicatorResults = async (): Promise<IndicatorResult[]> => {
  try {
    const { data } = await axiosInstance.get('/get/resultadoIndicador');
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map(mapApiIndicatorResultToFrontend);
  } catch (error) {
    console.error('Failed to fetch indicator results:', error);
    throw new Error('No se pudieron obtener los resultados de indicadores.');
  }
};

// Dropdown fetchers with caching

export const getFrequencies = async (forceRefresh = false): Promise<FrequencyOption[]> => {
  if (frequenciesCache && !forceRefresh) {
    return frequenciesCache;
  }

  try {
    const { data } = await axiosInstance.get('/get/frecuencia');
    
    if (!Array.isArray(data)) {
      return [];
    }

    frequenciesCache = data
      .filter((freq: ApiFrequency) => freq.freEstado)
      .map(mapApiFrequencyToOption);
    
    return frequenciesCache;
  } catch (error) {
    console.error('Failed to fetch frequencies:', error);
    throw new Error('No se pudieron obtener las frecuencias.');
  }
};

export const getTrends = async (forceRefresh = false): Promise<TrendOption[]> => {
  if (trendsCache && !forceRefresh) {
    return trendsCache;
  }

  try {
    const { data } = await axiosInstance.get('/get/tendencia');
    
    if (!Array.isArray(data)) {
      return [];
    }

    trendsCache = data
      .filter((trend: ApiTrend) => trend.tenEstado)
      .map(mapApiTrendToOption);
    
    return trendsCache;
  } catch (error) {
    console.error('Failed to fetch trends:', error);
    throw new Error('No se pudieron obtener las tendencias.');
  }
};

export const getUnitsOfMeasure = async (forceRefresh = false): Promise<UnitOption[]> => {
  if (unitsCache && !forceRefresh) {
    return unitsCache;
  }

  try {
    const { data } = await axiosInstance.get('/get/unidadDeMedida');
    
    if (!Array.isArray(data)) {
      return [];
    }

    unitsCache = data
      .filter((unit: ApiUnit) => unit.undEstado)
      .map(mapApiUnitToOption);
    
    return unitsCache;
  } catch (error) {
    console.error('Failed to fetch units of measure:', error);
    throw new Error('No se pudieron obtener las unidades de medida.');
  }
};

// Helper to clear cache if needed (e.g., on logout)
export const clearIndicatorOptionsCache = (): void => {
  frequenciesCache = null;
  trendsCache = null;
  unitsCache = null;
};
