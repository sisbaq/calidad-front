import { axiosInstance } from '@/api/axiosInstance';
import type {
  ApiImprovementPlan,
  ImprovementPlan,
  ImprovementPlanActivity,
  CreateImprovementPlanPayload,
  CreateActivityPayload,
  UpdateActivityPayload,
} from '@/types/improvement';
import {
  mapApiImprovementPlanToFrontend,
  mapApiActivityToFrontend,
} from '@mappers/improvement.mapper';

/**
 * Gets all improvement plans from the backend
 */
export const getImprovementPlans = async (): Promise<ImprovementPlan[]> => {
  try {
    const { data } = await axiosInstance.get('/get/planMejoramiento');
    if (!Array.isArray(data)) return [];

    return data.map(mapApiImprovementPlanToFrontend);
  } catch (error) {
    console.error('Failed to fetch improvement plans:', error);
    throw new Error('No se pudieron obtener los planes de mejoramiento.');
  }
};

/**
 * Gets all improvement plans from the backend (raw API format)
 */
export const getImprovementPlansRaw = async (): Promise<ApiImprovementPlan[]> => {
  const { data } = await axiosInstance.get('/get/planMejoramiento');
  if (!Array.isArray(data)) return [];

  return data;
};

/**
 * Gets all improvement plan activities from the backend
 */
export const getImprovementPlanActivities = async (): Promise<ImprovementPlanActivity[]> => {
  try {
    const { data } = await axiosInstance.get('/get/planActividadesMejoramiento');
    if (!Array.isArray(data)) return [];

    return data.map(mapApiActivityToFrontend);
  } catch (error) {
    console.error('Failed to fetch improvement plan activities:', error);
    throw new Error('No se pudieron obtener las actividades de mejoramiento.');
  }
};

/**
 * Gets all activities for a specific improvement plan by finding ID
 */
export const getImprovementPlanActivitiesByFindingId = async (
  findingId: string | number
): Promise<ImprovementPlanActivity[]> => {
  try {
    const { data } = await axiosInstance.get(
      `/get/planActividadesMejoramiento/byFinding/${findingId}`
    );
    if (!Array.isArray(data)) return [];
    return data.map(mapApiActivityToFrontend);
  } catch (error) {
    console.error('Failed to fetch improvement plan activities by finding ID:', error);
    throw new Error('No se pudieron obtener las actividades del plan de mejoramiento.');
  }
};

/**
 * Gets all activities for a specific improvement plan by plan ID
 */
export const getImprovementPlanActivitiesByPlanId = async (
  planId: string | number
): Promise<ImprovementPlanActivity[]> => {
  try {
    const { data } = await axiosInstance.get(
      `/get/planActividadesMejoramiento/${planId}`
    );
    if (!Array.isArray(data)) return [];
    return data.map(mapApiActivityToFrontend);
  } catch (error) {
    console.error('Failed to fetch improvement plan activities by plan ID:', error);
    throw new Error('No se pudieron obtener las actividades del plan de mejoramiento.');
  }
};

/**
 * Creates a new improvement plan
 */
export const createImprovementPlan = async (
  payload: CreateImprovementPlanPayload
): Promise<ImprovementPlan> => {
  try {
    const { data } = await axiosInstance.post('/crear/planMejoramiento', payload);
    return mapApiImprovementPlanToFrontend(data);
  } catch (error) {
    console.error('Failed to create improvement plan:', error);
    throw new Error('No se pudo crear el plan de mejoramiento.');
  }
};

/**
 * Updates an existing improvement plan
 */
export const updateImprovementPlan = async (
  planId: number | string,
  payload: Partial<CreateImprovementPlanPayload>
): Promise<ImprovementPlan> => {
  try {
    const { data } = await axiosInstance.put(`/editar/planMejoramiento/${planId}`, payload);
    return mapApiImprovementPlanToFrontend(data);
  } catch (error) {
    console.error('Failed to update improvement plan:', error);
    throw new Error('No se pudo actualizar el plan de mejoramiento.');
  }
};

/**
 * Deletes an improvement plan (soft delete)
 */
export const deleteImprovementPlan = async (planId: number | string): Promise<void> => {
  try {
    await axiosInstance.delete(`/delete/planMejoramiento/${planId}`);
  } catch (error) {
    console.error('Failed to delete improvement plan:', error);
    throw new Error('No se pudo eliminar el plan de mejoramiento.');
  }
};

/**
 * Closes an improvement plan by setting its status to CERRADO (2)
 */
export const closeImprovementPlan = async (
  planId: number | string,
  observacionCierre?: string
): Promise<ImprovementPlan> => {
  const payload: { plmEstadoPlan: number; observacionCierre?: string } = {
    plmEstadoPlan: 2,
  };

  if (observacionCierre) {
    payload.observacionCierre = observacionCierre;
  }

  const { data } = await axiosInstance.put(`/editar/planMejoramiento/${planId}`, payload);
  return mapApiImprovementPlanToFrontend(data);
};

/**
 * Creates multiple improvement plan activities
 */
export const createImprovementPlanActivities = async (
  activities: CreateActivityPayload[]
): Promise<ImprovementPlanActivity[]> => {
  try {
    const { data } = await axiosInstance.post('/crear/planActividadesMejoramiento', activities);
    if (!Array.isArray(data)) return [];
    return data.map(mapApiActivityToFrontend);
  } catch (error) {
    console.error('Failed to create improvement plan activities:', error);
    throw new Error('No se pudieron crear las actividades de mejoramiento.');
  }
};

/**
 * Updates an existing improvement plan activity
 */
export const updateImprovementPlanActivity = async (
  activityId: number | string,
  payload: UpdateActivityPayload
): Promise<ImprovementPlanActivity> => {
  try {
    const { data } = await axiosInstance.put(
      `/editar/planActividadesMejoramiento/${activityId}`,
      payload
    );
    return mapApiActivityToFrontend(data);
  } catch (error) {
    console.error('Failed to update improvement plan activity:', error);
    throw new Error('No se pudo actualizar la actividad de mejoramiento.');
  }
};

/**
 * Updates observation for a specific seguimiento of an activity
 */
export const updateActivityObservation = async (
  activityId: number | string,
  seguimiento: 1 | 2 | 3 | 4,
  observation: string
): Promise<ImprovementPlanActivity> => {
  try {
    const observationField = `actObservSeguimiento${seguimiento}` as keyof UpdateActivityPayload;
    const payload: UpdateActivityPayload = {
      [observationField]: observation,
    };

    const { data } = await axiosInstance.put(
      `/editar/planActividadesMejoramiento/${activityId}`,
      payload
    );
    return mapApiActivityToFrontend(data);
  } catch (error) {
    console.error('Failed to update activity observation:', error);
    throw new Error('No se pudo actualizar la observación.');
  }
};

/**
 * Deletes an improvement plan activity (soft delete)
 */
export const deleteImprovementPlanActivity = async (
  activityId: number | string
): Promise<void> => {
  try {
    await axiosInstance.delete(`/delete/planActividadesMejoramiento/${activityId}`);
  } catch (error) {
    console.error('Failed to delete improvement plan activity:', error);
    throw new Error('No se pudo eliminar la actividad de mejoramiento.');
  }
};

/**
 * Closes an improvement plan activity by setting actCerrada to true
 */
export const closeImprovementPlanActivity = async (
  activityId: number | string
): Promise<ImprovementPlanActivity> => {
  try {
    const payload: UpdateActivityPayload = {
      actCerrada: true,
    };

    const { data } = await axiosInstance.put(
      `/editar/planActividadesMejoramiento/${activityId}`,
      payload
    );
    return mapApiActivityToFrontend(data);
  } catch (error) {
    console.error('Failed to close improvement plan activity:', error);
    throw new Error('No se pudo cerrar la actividad de mejoramiento.');
  }
};

/**
 * Uploads a file for a specific seguimiento (follow-up) of an activity
 */
export const uploadActivityFollowupFile = async (
  activityId: number | string,
  seguimiento: 1 | 2 | 3 | 4,
  file: File
): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('seguimiento', seguimiento.toString());

    await axiosInstance.post(
      `/crear/archivo/planActividadMejoramiento/${activityId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  } catch (error) {
    console.error('Failed to upload activity followup file:', error);
    throw new Error('No se pudo subir el archivo de seguimiento.');
  }
};
