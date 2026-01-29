import { axiosInstance } from '@/api/axiosInstance';
import type { 
  Indicator, 
  IndicatorApiPayload,
  ApiFrequency,
  ApiTrend,
  ApiUnit,
  FrequencyOption,
  TrendOption,
  UnitOption,
} from '@/types/indicators';
import { 
  mapApiIndicatorToFrontend,
  mapApiFrequencyToOption,
  mapApiTrendToOption,
  mapApiUnitToOption,
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

    return data.map(mapApiIndicatorToFrontend);
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
