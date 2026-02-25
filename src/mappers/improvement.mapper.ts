import type {
  ApiImprovementPlan,
  ApiImprovementPlanActivity,
  ImprovementPlan,
  ImprovementPlanActivity,
  ImprovementPlanWithDetails,
} from '@/types/improvement';

/**
 * Maps plan status number to status string
 */
export const mapPlanStatus = (status: number): 'Abierto' | 'Cerrado' | 'Vencido' => {
  const statusMap: Record<number, 'Abierto' | 'Cerrado' | 'Vencido'> = {
    1: 'Abierto',
    2: 'Cerrado',
    3: 'Vencido',
  };
  return statusMap[status] || 'Abierto';
};

/**
 * Maps API improvement plan response to frontend ImprovementPlan interface
 */
export const mapApiImprovementPlanToFrontend = (
  apiPlan: ApiImprovementPlan
): ImprovementPlan => {
  // Handle nested activities if present
  const activities = Array.isArray(apiPlan.actividades)
    ? apiPlan.actividades
        .filter((act) => act.actEstado === true)
        .map(mapApiActivityToFrontend)
    : undefined;

  return {
    id: apiPlan.plmId,
    findingId: apiPlan.fkIdHallazgo?.idHallazgo || 0,
    causeAnalysis: apiPlan.plmAnalisisDeCausa,
    startDate: apiPlan.plmFechaInicio,
    endDate: apiPlan.plmFechaFinal,
    status: apiPlan.plmEstadoPlan,
    createdAt: apiPlan.plmCreadoEn,
    updatedAt: apiPlan.plmActualizadoEl || undefined,
    activities,
  };
};

/**
 * Maps API activity response to frontend ImprovementPlanActivity interface
 */
export const mapApiActivityToFrontend = (
  apiActivity: ApiImprovementPlanActivity
): ImprovementPlanActivity & { planId: number } => {
  const planId = typeof apiActivity.fkPlanMejoramiento === 'object' && 'plmId' in apiActivity.fkPlanMejoramiento
    ? apiActivity.fkPlanMejoramiento.plmId
    : 0;

  return {
    id: apiActivity.actId,
    description: apiActivity.actNomActividad,
    closed: apiActivity.actCerrada || false,
    followup1: apiActivity.actSeguimiento1 || '',
    followup2: apiActivity.actSeguimiento2 || '',
    followup3: apiActivity.actSeguimiento3 || '',
    followup4: apiActivity.actSeguimiento4 || '',
    followup1Sent: Boolean(apiActivity.actSeguimiento1),
    followup2Sent: Boolean(apiActivity.actSeguimiento2),
    followup3Sent: Boolean(apiActivity.actSeguimiento3),
    followup4Sent: Boolean(apiActivity.actSeguimiento4),
    followup1Comment: apiActivity.actObservSeguimiento1 || undefined,
    followup2Comment: apiActivity.actObservSeguimiento2 || undefined,
    followup3Comment: apiActivity.actObservSeguimiento3 || undefined,
    followup4Comment: apiActivity.actObservSeguimiento4 || undefined,
    planId,
    files: {
      1: apiActivity.actAnexoSeguimiento1 ? { url: apiActivity.actAnexoSeguimiento1, name: 'Seguimiento 1' } : null,
      2: apiActivity.actAnexoSeguimiento2 ? { url: apiActivity.actAnexoSeguimiento2, name: 'Seguimiento 2' } : null,
      3: apiActivity.actAnexoSeguimiento3 ? { url: apiActivity.actAnexoSeguimiento3, name: 'Seguimiento 3' } : null,
      4: apiActivity.actAnexoSeguimiento4 ? { url: apiActivity.actAnexoSeguimiento4, name: 'Seguimiento 4' } : null,
    },
  };
};

/**
 * Maps API plan to ImprovementPlanWithDetails for table display
 * Includes all plan data plus additional display fields
 */
export const mapApiPlanToTableRow = (apiPlan: ApiImprovementPlan): ImprovementPlanWithDetails => {
  const activities = Array.isArray(apiPlan.actividades)
    ? apiPlan.actividades
        .filter((act) => act.actEstado === true)
        .map(mapApiActivityToFrontend)
    : undefined;

  return {
    id: apiPlan.plmId,
    findingId: apiPlan.fkIdHallazgo?.idHallazgo || 0,
    causeAnalysis: apiPlan.plmAnalisisDeCausa,
    startDate: apiPlan.plmFechaInicio,
    endDate: apiPlan.plmFechaFinal,
    status: apiPlan.plmEstadoPlan,
    createdAt: apiPlan.plmCreadoEn,
    updatedAt: apiPlan.plmActualizadoEl || undefined,
    activities,
    processName: apiPlan.fkIdHallazgo?.fkIdProceso?.nombre || 'N/A',
    findingDescription: apiPlan.fkIdHallazgo?.descripcionHecho || 'Sin título',
    findingNumeral: apiPlan.fkIdHallazgo?.numeral || 'N/A',
    responsibleName: apiPlan.fkIdHallazgo?.reportadoPor || 'No asignado',
    closingObservation: apiPlan.observacionCierre || undefined,
  };
};
