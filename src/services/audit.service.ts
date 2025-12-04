import { axiosInstance } from '@/api/axiosInstance';
import type { AuditPlan, AuditReport } from '@/types/audit';
import {
  mapApiPlanToFrontend,
  mapFrontendPlanToApi,
  mapApiReportToFrontend,
  mapApiPlanWithReportsToFrontend
} from '@/mappers/audit.mapper';
import { PLAN_OPTIONS } from '@/constants/audit.constants';

const uploadFile = async (planId: number | string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('archivo', file);

  try {
    const { data } = await axiosInstance.post(`/crear/archivo/planAuditoria/${planId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.filePath;
  } catch (error) {
    console.error('Failed to upload file:', error);
    throw new Error('No se pudo subir el archivo.');
  }
};

const uploadReportFile = async (reportId: number | string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('archivo', file);

  try {
    const { data } = await axiosInstance.post(`/crear/archivo/informeAuditoria/${reportId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.filePath;
  } catch (error) {
    console.error('Failed to upload report file:', error);
    throw new Error('No se pudo subir el archivo del informe.');
  }
};

export const getAuditPlans = async (): Promise<AuditPlan[]> => {
  try {
    const { data } = await axiosInstance.get('/get/planAuditoria');

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format');
    }

    return data.map(mapApiPlanToFrontend);
  } catch (error) {
    console.error('Failed to fetch audit plans:', error);
    throw new Error('No se pudieron obtener los planes de auditoría.');
  }
};

export const getAuditReports = async (): Promise<AuditReport[]> => {
  try {
    const { data } = await axiosInstance.get('/get/informeAuditoria');
    if (!Array.isArray(data)) return [];
    // The backend returns the reports with the full plan object nested
    // We need to map them to our frontend type
    return data.map(mapApiReportToFrontend);
  } catch (error) {
    console.error('Failed to fetch audit reports:', error);
    throw new Error('No se pudieron obtener los informes de auditoría.');
  }
};

export const getAuditPlansWithReports = async (): Promise<AuditPlan[]> => {
  try {
    const { data } = await axiosInstance.get('/get/planesConInformes');
    if (!Array.isArray(data)) return [];
    return data.map(mapApiPlanWithReportsToFrontend);
  } catch (error) {
    console.error('Failed to fetch audit plans with reports:', error);
    throw new Error('No se pudieron obtener los planes con sus informes de auditoría.');
  }
};

interface CreateAuditPlanPayload {
  description: string;
  planType: string;
  file: File;
}

export const createAuditPlan = async ({ description, planType, file }: CreateAuditPlanPayload): Promise<AuditPlan> => {
  let createdPlan: AuditPlan | null = null;
  try {
    const planOption = PLAN_OPTIONS.find((opt) => opt.value === planType);
    if (!planOption) {
      throw new Error(`Invalid plan type: ${planType}`);
    }

    const payload = {
      descripcion: description,
      fkTipoDeAuditoria: planOption.id,
      linkPlanAuditoria: '',
    };

    const { data } = await axiosInstance.post('/crear/planAuditoria', payload);
    createdPlan = mapApiPlanToFrontend(data);

    const filePath = await uploadFile(createdPlan.id, file);

    // The backend only returns the path, so we'll update the createdPlan
    // The mapper should handle the file name, but we can't know the size or type here
    createdPlan.fileMeta.url = filePath;
    createdPlan.fileMeta.name = file.name;

    return createdPlan;
  } catch (error) {
    console.error('Failed to create audit plan:', error);
    if (createdPlan) {
      throw new Error('Plan creado, pero ocurrió un error al subir el archivo. Por favor, intente actualizar el plan con el archivo nuevamente.');
    } else {
      throw new Error('No se pudo crear el plan de auditoría. Intente más tarde.');
    }
  }
};

export const updateAuditPlan = async (plan: AuditPlan, newFile: File | null): Promise<AuditPlan> => {
  try {
    const planToUpdate = { ...plan };

    if (newFile) {
      const newPath = await uploadFile(plan.id, newFile);
      planToUpdate.fileMeta.url = newPath;
      planToUpdate.fileMeta.name = newFile.name;
    }

    const payload = mapFrontendPlanToApi(planToUpdate);

    const { data } = await axiosInstance.put(`/editar/planAuditoria/${plan.id}`, payload);

    return mapApiPlanToFrontend(data.plan);
  } catch (error) {
    console.error('Failed to update audit plan:', error);
    throw new Error('No se pudo actualizar el plan de auditoría.');
  }
};

export const deleteAuditPlan = async (planId: number | string): Promise<void> => {
  try {
    await axiosInstance.delete(`/delete/planAuditoria/${planId}`);
  } catch (error) {
    console.error('Failed to delete audit plan:', error);
    throw new Error('No se pudo eliminar el plan de auditoría.');
  }
};

export const createAuditReport = async (
  planId: number | string,
  description: string,
  file: File
): Promise<AuditReport> => {
  let createdReport: any = null;
  try {
    const payload = {
      descripcion: description,
      fkIdPlanAuditoria: planId,
    };
    const { data } = await axiosInstance.post('/crear/informeAuditoria', payload);
    createdReport = data;

    const filePath = await uploadReportFile(createdReport.idInforme, file);
    createdReport.linkInforme = filePath; // Update with the real path
    createdReport.creadoEn = new Date(); // The API does not return the date, so we put the current one

    return mapApiReportToFrontend(createdReport);
  } catch (error) {
    console.error('Failed to create audit report:', error);
    if (createdReport) {
      throw new Error('Informe creado, pero ocurrió un error al subir el archivo.');
    } else {
      throw new Error('No se pudo crear el informe de auditoría.');
    }
  }
};

export const updateAuditReport = async (
  reportId: number | string,
  description: string,
  newFile: File | null
): Promise<AuditReport> => {
  try {
    if (newFile) {
      await uploadReportFile(reportId, newFile);
    }

    const payload = {
      descripcion: description,
    };
    const { data } = await axiosInstance.put(`/editar/informeAuditoria/${reportId}`, payload);

    const updatedReport = mapApiReportToFrontend(data);
    if (newFile) {
      updatedReport.name = newFile.name;
      updatedReport.createdAt = new Date().toISOString();
    }
    return updatedReport;
  } catch (error) {
    console.error('Failed to update audit report:', error);
    throw new Error('No se pudo actualizar el informe de auditoría.');
  }
};

export const deleteAuditReport = async (reportId: number | string): Promise<void> => {
  try {
    await axiosInstance.delete(`/delete/informeAuditoria/${reportId}`);
  } catch (error) {
    console.error('Failed to delete audit report:', error);
    throw new Error('No se pudo eliminar el informe de auditoría.');
  }
};
