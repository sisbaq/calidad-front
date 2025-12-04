import { axiosInstance } from '@/api/axiosInstance';
import type { 
  Finding, 
  ApiProcess, 
  ApiSource,
  ProcessOption,
  SourceOption,
  FindingTypeOption,
  } from '@/types/audit';
import {
  mapApiFindingToFrontend,
  mapFrontendFindingToApi,
  mapApiProcessToOption,
  mapApiFindingTypeToOption,
} from '@/mappers/findings.mapper';
/**
 * Maps API source response to frontend SourceOption
 */
const mapApiSourceToOption = (apiSource: ApiSource): SourceOption => {
  return {
    id: apiSource.fteId,
    name: apiSource.fteNombre,
  };
};

/**
 * Gets all available processes for the dropdown options
 */
export const getProcesses = async (): Promise<ProcessOption[]> => {
  try {
    const { data } = await axiosInstance.get('/get/procesos');
    if (!Array.isArray(data)) return [];
    
    return data
      .filter((process: ApiProcess) => process.estado)
      .map(mapApiProcessToOption);
  } catch (error) {
    console.error('Failed to fetch processes:', error);
    throw new Error('No se pudieron obtener los procesos.');
  }
};

/**
 * Gets all available sources (fuentes) for the dropdown options
 */
export const getSources = async (): Promise<SourceOption[]> => {
  try {
    const { data } = await axiosInstance.get('/get/fuentes');
    if (!Array.isArray(data)) return [];
    
    return data
      .filter((source: ApiSource) => source.fteEstado)
      .map(mapApiSourceToOption);
  } catch (error) {
    console.error('Failed to fetch sources:', error);
    throw new Error('No se pudieron obtener las fuentes.');
  }
};

/**
 * Gets all available finding types for dropdown options
 */
export const getFindingTypes = async (): Promise<FindingTypeOption[]> => {
  try {
    const { data } = await axiosInstance.get('/get/tipoHallazgos');
    if (!Array.isArray(data)) return [];
    
    return data.map(mapApiFindingTypeToOption);
  } catch (error) {
    console.error('Failed to fetch finding types:', error);
    throw new Error('No se pudieron obtener los tipos de hallazgo.');
  }
};

/**
 * Gets all findings from the backend
 */
export const getFindings = async (): Promise<Finding[]> => {
  try {
    const { data } = await axiosInstance.get('/get/hallazgos');
    if (!Array.isArray(data)) return [];
    
    return data.map(mapApiFindingToFrontend);
  } catch (error) {
    console.error('Failed to fetch findings:', error);
    throw new Error('No se pudieron obtener los hallazgos.');
  }
};

export const getFindingsByProcess = async (): Promise<Finding[]> => {
  try {
    const { data } = await axiosInstance.get('/get/hallazgosPorProceso');
    if (!Array.isArray(data)) return [];
    return data.map(mapApiFindingToFrontend);
  } catch (error) {
    console.error('Failed to fetch findings by process:', error);
    throw new Error('No se pudieron obtener los hallazgos por proceso.');
  }
};

interface CreateFindingPayload {
  finding: Omit<Finding, 'id'>;
  processId: number;
  auditReportId: number;
  auditTypeId: number;
  findingTypeId: number;
  sourceId?: number;
}

/**
 * Creates a new finding
 */
export const createFinding = async ({
  finding,
  processId,
  auditReportId,
  auditTypeId,
  findingTypeId,
  sourceId,
}: CreateFindingPayload): Promise<Finding> => {
  try {
    const payload = mapFrontendFindingToApi(
      finding,
      processId,
      auditReportId,
      auditTypeId,
      findingTypeId,
      sourceId
    );

    console.log(payload);

    const { data } = await axiosInstance.post('/crear/hallazgo', payload);
    return mapApiFindingToFrontend(data);
  } catch (error) {
    console.error('Failed to create finding:', error);
    throw new Error('No se pudo crear el hallazgo.');
  }
};

interface UpdateFindingPayload {
  findingId: number | string;
  finding: Omit<Finding, 'id'>;
  processId: number;
  auditTypeId: number;
  findingTypeId: number;
  sourceId?: number;
}

/**
 * Updates an existing finding
 */
export const updateFinding = async ({
  findingId,
  finding,
  processId,
  auditTypeId,
  findingTypeId,
  sourceId,
}: UpdateFindingPayload): Promise<Finding> => {
  try {
    const auditReportId = parseInt(finding.auditReportId);
    
    const payload = mapFrontendFindingToApi(
      finding,
      processId,
      auditReportId,
      auditTypeId,
      findingTypeId,
      sourceId,
    );

    await axiosInstance.put(`/editar/hallazgo/${findingId}`, payload);
    
    return {
      ...finding,
      id: findingId.toString(),
    } as Finding;
  } catch (error) {
    console.error('Failed to update finding:', error);
    throw new Error('No se pudo actualizar el hallazgo.');
  }
};

/**
 * Deletes a finding (soft delete - sets estado to false)
 */
export const deleteFinding = async (findingId: number | string): Promise<void> => {
  try {
    await axiosInstance.delete(`/delete/hallazgo/${findingId}`);
  } catch (error) {
    console.error('Failed to delete finding:', error);
    throw new Error('No se pudo eliminar el hallazgo.');
  }
};

// Helper function to get process ID by name
export const getProcessIdByName = async (processName: string): Promise<number | null> => {
  try {
    const processes = await getProcesses();
    const process = processes.find(p => p.name === processName);
    return process ? process.id : null;
  } catch (error) {
    console.error('Failed to find process by name:', error);
    return null;
  }
};


/**
 * Gets the backend source ID for a given source name
 * @param sourceName - The display name of the source
 * @param sources - Array of available sources
 * @returns The corresponding backend ID or null if not found
 */
export const getSourceIdByName = (sourceName: string, sources: SourceOption[]): number | null => {
  if (!sourceName) return null;
  const source = sources.find(s => s.name === sourceName);
  return source ? source.id : null;
};

/**
 * Gets the backend audit type ID for a given audit type name
 * @param auditTypeName - The display name of the audit type (e.g., "Interna", "Externa")
 * @returns The corresponding backend ID or null if not found
 */
export const getAuditTypeIdByName = (auditTypeName: string): number | null => {
  if (!auditTypeName) return null;
  const mapping: Record<string, number> = {
    'Interna': 1,
    'Externa': 2,
  };
  return mapping[auditTypeName] || null;
};

/**
 * Gets the backend finding type ID for a given finding type name
 * @param findingTypeName - The display name of the finding type
 * @returns The corresponding backend ID or null if not found
 */
export const getFindingTypeIdByName = (findingTypeName: string, findingTypes: FindingTypeOption[]): number | null => {
  if (!findingTypeName) return null;
  const findingType = findingTypes.find(ft => ft.name === findingTypeName);
  return findingType ? findingType.id : null;
};
