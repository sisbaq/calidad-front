import type { 
  ApiFinding, 
  Finding, 
  ApiProcess, 
  ProcessOption,
  ApiFindingType,
  FindingTypeOption
} from '@/types/audit';

/**
 * Maps API finding response to frontend Finding interface
 */
export const mapApiFindingToFrontend = (apiFinding: ApiFinding): Finding => {
  return {
    id: apiFinding.idHallazgo.toString(),
    auditReportId: apiFinding.idInformeAuditoria.idInforme.toString(),
    auditReportDescription: apiFinding.idInformeAuditoria.descripcion,
    reportedOnDate: apiFinding.reportadoEn || '',
    auditedProcess: apiFinding.fkIdProceso.nombre,
    auditType: apiFinding.tipoAuditoria.tpaNombreTipo,
    findingType: apiFinding.tipoHallazgo.tphNomHallazgo,
    source: apiFinding.fkFuente?.fteNombre || '',
    requirementNumeral: apiFinding.numeral || '',
    description: apiFinding.descripcionHecho,
    condition: apiFinding.condicion || '',
    reportedBy: apiFinding.reportadoPor || '',
  };
};

export const mapFrontendFindingToApi = (
  finding: Omit<Finding, 'id'>,
  processId: number,
  auditReportId: number,
  auditTypeId: number,
  findingTypeId: number,
  sourceId?: number
) => {
  return {
    descripcionHecho: finding.description,
    condicion: finding.condition,
    numeral: finding.requirementNumeral,
    reportadoEn: finding.reportedOnDate,
    idInformeAuditoria: auditReportId,
    fkIdProceso: processId,
    tipoAuditoria: auditTypeId,
    tipoHallazgo: findingTypeId,
    reportadoPor: finding.reportedBy || null,
    fkFuente: sourceId !== undefined ? sourceId : null,
  };
};

/**
 * Maps API process response to frontend ProcessOption
 */
export const mapApiProcessToOption = (apiProcess: ApiProcess): ProcessOption => {
  return {
    id: apiProcess.idProceso,
    name: apiProcess.nombre,
    description: apiProcess.objetivo,
  };
};

/**
 * Maps API finding type response to frontend FindingTypeOption
 */
export const mapApiFindingTypeToOption = (apiFindingType: ApiFindingType): FindingTypeOption => {
  return {
    id: apiFindingType.tphId,
    name: apiFindingType.tphNomHallazgo,
  };
};
