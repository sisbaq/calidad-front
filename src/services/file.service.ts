import { axiosInstance } from '@/api/axiosInstance';

/**
 * Centralized File Download/View Service
 * 
 * Provides authenticated file access through the new backend endpoints:
 * /Sisbaq/files/{entityType}/{id}[/{seguimiento}]
 * 
 * All functions use axiosInstance which includes Bearer token authentication.
 */

/**
 * Helper function to extract filename from Content-Disposition header.
 * Prefers RFC 5987 filename*=UTF-8''... over the basic filename="..." fallback.
 */
const getFilenameFromResponse = (response: any, fallback: string): string => {
  const contentDisposition = response.headers['content-disposition'];
  if (contentDisposition) {
    // Try RFC 5987 filename* first — properly encoded UTF-8 name
    const rfc5987Match = contentDisposition.match(/filename\*=UTF-8''([^;\n\s]*)/i);
    if (rfc5987Match?.[1]) {
      try {
        return decodeURIComponent(rfc5987Match[1]);
      } catch {
        // fall through to basic filename
      }
    }
    // Fall back to basic filename=""
    const basicMatch = contentDisposition.match(/filename="([^"]*)"/);
    if (basicMatch?.[1]) {
      return basicMatch[1];
    }
  }
  return fallback;
};

/**
 * Helper function to trigger file download from blob
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Helper function to open blob in new tab
 */
const viewBlob = (blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  // Note: URL will be revoked when the window is closed or navigated away
  setTimeout(() => URL.revokeObjectURL(url), 60000); // Cleanup after 1 minute
};

// ==================== DOCUMENTACION (SigDocumento) ====================

/**
 * Downloads a SigDocumento file
 * @param docId - The document ID
 */
export const downloadDocumentacionFile = async (docId: number | string): Promise<void> => {
  try {
    const { data, headers } = await axiosInstance.get(`/files/documentacion/${docId}`, {
      responseType: 'blob',
    });
    const filename = getFilenameFromResponse({ headers }, `documento-${docId}.pdf`);
    downloadBlob(data, filename);
  } catch (error) {
    console.error('Failed to download documentacion file:', error);
    throw new Error('No se pudo descargar el archivo del documento.');
  }
};

/**
 * Opens a SigDocumento file in a new tab
 * @param docId - The document ID
 */
export const viewDocumentacionFile = async (docId: number | string): Promise<void> => {
  try {
    const { data } = await axiosInstance.get(`/files/documentacion/${docId}`, {
      responseType: 'blob',
    });
    viewBlob(data);
  } catch (error) {
    console.error('Failed to view documentacion file:', error);
    throw new Error('No se pudo abrir el archivo del documento.');
  }
};

// ==================== PLAN AUDITORIA ====================

/**
 * Downloads a PlanAuditoria file
 * @param planId - The audit plan ID
 */
export const downloadPlanAuditoriaFile = async (planId: number | string): Promise<void> => {
  try {
    const { data, headers } = await axiosInstance.get(`/files/planAuditoria/${planId}`, {
      responseType: 'blob',
    });
    const filename = getFilenameFromResponse({ headers }, `plan-auditoria-${planId}.pdf`);
    downloadBlob(data, filename);
  } catch (error) {
    console.error('Failed to download plan auditoria file:', error);
    throw new Error('No se pudo descargar el plan de auditoría.');
  }
};

/**
 * Opens a PlanAuditoria file in a new tab
 * @param planId - The audit plan ID
 */
export const viewPlanAuditoriaFile = async (planId: number | string): Promise<void> => {
  try {
    const { data } = await axiosInstance.get(`/files/planAuditoria/${planId}`, {
      responseType: 'blob',
    });
    viewBlob(data);
  } catch (error) {
    console.error('Failed to view plan auditoria file:', error);
    throw new Error('No se pudo abrir el plan de auditoría.');
  }
};

// ==================== INFORME AUDITORIA ====================

/**
 * Downloads an InformeAuditoria file
 * @param informeId - The audit report ID
 */
export const downloadInformeAuditoriaFile = async (informeId: number | string): Promise<void> => {
  try {
    const { data, headers } = await axiosInstance.get(`/files/informeAuditoria/${informeId}`, {
      responseType: 'blob',
    });
    const filename = getFilenameFromResponse({ headers }, `informe-auditoria-${informeId}.pdf`);
    downloadBlob(data, filename);
  } catch (error) {
    console.error('Failed to download informe auditoria file:', error);
    throw new Error('No se pudo descargar el informe de auditoría.');
  }
};

/**
 * Opens an InformeAuditoria file in a new tab
 * @param informeId - The audit report ID
 */
export const viewInformeAuditoriaFile = async (informeId: number | string): Promise<void> => {
  try {
    const { data } = await axiosInstance.get(`/files/informeAuditoria/${informeId}`, {
      responseType: 'blob',
    });
    viewBlob(data);
  } catch (error) {
    console.error('Failed to view informe auditoria file:', error);
    throw new Error('No se pudo abrir el informe de auditoría.');
  }
};

// ==================== PLAN ACTIVIDAD MEJORAMIENTO ====================

/**
 * Downloads a PlanActividadMejoramiento followup file
 * @param actId - The activity ID
 * @param seguimiento - The followup number (1-4)
 */
export const downloadPlanActividadMejoramientoFile = async (
  actId: number | string,
  seguimiento: 1 | 2 | 3 | 4
): Promise<void> => {
  try {
    const { data, headers } = await axiosInstance.get(
      `/files/planActividadMejoramiento/${actId}/${seguimiento}`,
      { responseType: 'blob' }
    );
    const filename = getFilenameFromResponse({ headers }, `actividad-${actId}-seguimiento-${seguimiento}.pdf`);
    downloadBlob(data, filename);
  } catch (error: any) {
    console.error('Failed to download plan actividad mejoramiento file:', error);
    // Preserve the backend error message if available
    if (error?.response?.data) {
      if (error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const jsonError = JSON.parse(text);
          throw new Error(jsonError.error || 'No se pudo descargar el archivo de seguimiento.');
        } catch {
          throw new Error('No se pudo descargar el archivo de seguimiento.');
        }
      } else if (typeof error.response.data === 'object' && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
    }
    throw new Error('No se pudo descargar el archivo de seguimiento.');
  }
};

/**
 * Opens a PlanActividadMejoramiento followup file in a new tab
 * @param actId - The activity ID
 * @param seguimiento - The followup number (1-4)
 */
export const viewPlanActividadMejoramientoFile = async (
  actId: number | string,
  seguimiento: 1 | 2 | 3 | 4
): Promise<void> => {
  try {
    const { data } = await axiosInstance.get(
      `/files/planActividadMejoramiento/${actId}/${seguimiento}`,
      { responseType: 'blob' }
    );
    viewBlob(data);
  } catch (error: any) {
    console.error('Failed to view plan actividad mejoramiento file:', error);
    // Preserve the backend error message if available
    if (error?.response?.data) {
      // For blob responses, the error might be a blob, so we need to parse it
      if (error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const jsonError = JSON.parse(text);
          throw new Error(jsonError.error || 'No se pudo abrir el archivo de seguimiento.');
        } catch {
          throw new Error('No se pudo abrir el archivo de seguimiento.');
        }
      } else if (typeof error.response.data === 'object' && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
    }
    throw new Error('No se pudo abrir el archivo de seguimiento.');
  }
};

// ==================== CONTEXTO ORGANIZACION ====================

/**
 * Downloads a ContextoOrganizacion file
 * @param ctxId - The context ID
 */
export const downloadContextoOrganizacionFile = async (ctxId: number | string): Promise<void> => {
  try {
    const { data, headers } = await axiosInstance.get(`/files/contextoOrganizacion/${ctxId}`, {
      responseType: 'blob',
    });
    const filename = getFilenameFromResponse({ headers }, `contexto-organizacion-${ctxId}.pdf`);
    downloadBlob(data, filename);
  } catch (error) {
    console.error('Failed to download contexto organizacion file:', error);
    throw new Error('No se pudo descargar el archivo del contexto de organización.');
  }
};

/**
 * Opens a ContextoOrganizacion file in a new tab
 * @param ctxId - The context ID
 */
export const viewContextoOrganizacionFile = async (ctxId: number | string): Promise<void> => {
  try {
    const { data } = await axiosInstance.get(`/files/contextoOrganizacion/${ctxId}`, {
      responseType: 'blob',
    });
    viewBlob(data);
  } catch (error) {
    console.error('Failed to view contexto organizacion file:', error);
    throw new Error('No se pudo abrir el archivo del contexto de organización.');
  }
};
