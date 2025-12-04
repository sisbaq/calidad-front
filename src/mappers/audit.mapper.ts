// import type { PlanOption } from '@/types/audit';
import type { AuditPlan, AuditReport } from '@/types/audit';
import { PLAN_OPTIONS } from '@/constants/audit.constants';

/**
 * Maps a plan object from the API format to the frontend format.
 * It handles inconsistent API responses for fkTipoDeAuditoria (object vs. number).
 * @param apiPlan - The raw plan object from the API.
 * @returns An AuditPlan object for the frontend.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapApiPlanToFrontend = (apiPlan: any): AuditPlan => {
  // Handle both { tpaId: 1 } and just 1 as the value
  const typeId = typeof apiPlan.fkTipoDeAuditoria === 'object'
    ? apiPlan.fkTipoDeAuditoria.tpaId
    : apiPlan.fkTipoDeAuditoria;

  const planOption = PLAN_OPTIONS.find(opt => opt.id === typeId);
  const fileName = apiPlan.linkPlanAuditoria?.split('/').pop() || 'Archivo sin nombre';

  return {
    id: apiPlan.idPlan || 'unknown',
    createdAt: apiPlan.creadoEl,
    description: apiPlan.descripcion || 'Sin descripción',
    planType: planOption?.value || 'riesgos', // Default to 'riesgos' if not found
    planLabel: planOption?.label || 'No definido',
    fileMeta: {
      name: fileName,
      url: apiPlan.linkPlanAuditoria || '',
      size: 0,
      type: '',
    },
    reports: [],
  };
};

/**
 * Maps a frontend AuditPlan object to the format expected by the API (Spanish keys).
 * @param plan - The AuditPlan object from the frontend.
 * @returns An object formatted for the API.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapFrontendPlanToApi = (plan: AuditPlan): any => {
  const planOption = PLAN_OPTIONS.find(opt => opt.value === plan.planType);

  return {
    idPlan: plan.id,
    linkPlanAuditoria: plan.fileMeta.url,
    descripcion: plan.description,
    fkTipoDeAuditoria: planOption?.id || 1,
  };
};

export const mapApiReportToFrontend = (apiReport: any): AuditReport => {
  const fileName = apiReport.linkInforme?.split('\\').pop()?.split('/').pop() || 'Informe sin nombre';

  return {
    id: apiReport.idInforme || 'unknown',
    name: fileName,
    type: 'Informe',
    url: apiReport.linkInforme || '',
    createdAt: apiReport.creadoEn,
    desc: apiReport.descripcion || 'Sin descripción',
    planId: apiReport.fkIdPlanAuditoria?.idPlan || undefined,
  };
};


export const mapApiPlanWithReportsToFrontend = (apiPlan: any): AuditPlan => {
  // Handle both { tpaId: 1 } and just 1 as the value
  const typeId = typeof apiPlan.fkTipoDeAuditoria === 'object'
    ? apiPlan.fkTipoDeAuditoria.tpaId
    : apiPlan.fkTipoDeAuditoria;

  const planOption = PLAN_OPTIONS.find(opt => opt.id === typeId);
  const fileName = apiPlan.linkPlanAuditoria?.split('/').pop() || 'Archivo sin nombre';

  // Map nested informes array if it exists
  const reports = Array.isArray(apiPlan.informes)
    ? apiPlan.informes.map(mapApiReportToFrontend)
    : [];

  return {
    id: apiPlan.idPlan || 'unknown',
    createdAt: apiPlan.creadoEl,
    description: apiPlan.descripcion || 'Sin descripción',
    planType: planOption?.value || 'riesgos', // Default to 'riesgos' if not found
    planLabel: planOption?.label || 'No definido',
    fileMeta: {
      name: fileName,
      url: apiPlan.linkPlanAuditoria || '',
      size: 0,
      type: '',
    },
    reports,
  };
};
