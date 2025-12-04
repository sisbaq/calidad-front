import type { SigDocument, CreateDocumentPayload, UpdateDocumentPayload } from '@/types/document';

/**
 * Maps a document object from the API format to the frontend format.
 * Flattens nested relations for easier use in components.
 * @param apiDoc - The raw document object from the API with all relations.
 * @returns A SigDocument object for the frontend.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapApiDocumentToFrontend = (apiDoc: any): SigDocument => {
  return {
    id: apiDoc.docId,
    codigo: apiDoc.docCodigo || '',
    descripcion: apiDoc.docDescripcion || '',
    fileUrl: apiDoc.docLinkDocumento || '',
    version: apiDoc.docVersion || '',
    estado: apiDoc.docEstado ?? true,
    createdAt: apiDoc.docCreado || new Date().toISOString(),
    updatedAt: apiDoc.docActualizadoEl || new Date().toISOString(),
    isTransversal: apiDoc.docTransversal ?? false,
    previousDocumentId: apiDoc.fkDocumentoAnterior || null,
    observation: apiDoc.observacion || null,

    // Process information
    processId: apiDoc.fkProceso?.idProceso || 0,
    processName: apiDoc.fkProceso?.nombre || 'Sin proceso',

    // Document type information
    documentTypeId: apiDoc.sigTipoDocumento?.tipId || 0,
    documentTypeName: apiDoc.sigTipoDocumento?.tipNombre || 'Sin tipo',
    documentTypeSigla: apiDoc.sigTipoDocumento?.tipSigla || '',

    // Creator information
    createdByUserId: apiDoc.creadoPor?.idUsuario || 0,
    createdByUserName: apiDoc.creadoPor?.nombreCompleto || 'Desconocido',

    // Revision status information
    revisionStatusId: apiDoc.sigEstadoRevision?.edrId || 1,
    revisionStatusName: apiDoc.sigEstadoRevision?.edrNomEstado || 'Por revisar',
  };
};

/**
 * Maps a frontend SigDocument object to the format expected by the API for updates.
 * @param document - The SigDocument object from the frontend.
 * @returns An object formatted for the API update endpoint.
 */
export const mapFrontendDocumentToUpdateApi = (document: Partial<SigDocument>): UpdateDocumentPayload => {
  const payload: UpdateDocumentPayload = {};

  if (document.codigo !== undefined) payload.docCodigo = document.codigo;
  if (document.descripcion !== undefined) payload.docDescripcion = document.descripcion;
  if (document.version !== undefined) payload.docVersion = document.version;
  if (document.documentTypeId !== undefined) payload.sigTipoDocumento = document.documentTypeId;
  if (document.previousDocumentId !== undefined) payload.fkDocumentoAnterior = document.previousDocumentId;
  if (document.revisionStatusId !== undefined) payload.sigEstadoRevision = document.revisionStatusId;

  return payload;
};

/**
 * Creates a payload for creating a new document.
 * @param data - The document data for creation.
 * @returns An object formatted for the API create endpoint.
 */
export const createDocumentPayload = (data: {
  codigo: string;
  descripcion: string;
  version: string;
  tipoDocumentoId: number;
  procesoId?: number; // Optional - only for transversal documents
  documentoAnteriorId?: number | null;
}): CreateDocumentPayload => {
  const payload: CreateDocumentPayload = {
    docCodigo: data.codigo,
    docDescripcion: data.descripcion,
    docVersion: data.version,
    sigTipoDocumento: data.tipoDocumentoId,
    fkDocumentoAnterior: data.documentoAnteriorId || null,
  };

  // Only include fkProceso if provided (transversal documents)
  if (data.procesoId !== undefined) {
    payload.fkProceso = data.procesoId;
  }

  return payload;
};
