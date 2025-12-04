import { axiosInstance } from '@/api/axiosInstance';
import type {
  SigDocument,
  DocumentType,
  RevisionStatus,
  // CreateDocumentPayload,
  // UpdateDocumentPayload
} from '@/types/document';
import {
  mapApiDocumentToFrontend,
  mapFrontendDocumentToUpdateApi,
  createDocumentPayload
} from '@/mappers/document.mapper';

/**
 * Uploads a file for an existing document.
 * The file is stored in files/sigDocumento/{docId}/ on the server.
 * @param docId - The ID of the document.
 * @param file - The file to upload (PDF).
 * @returns The file path on the server.
 */
const uploadFile = async (docId: number | string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('archivo', file);

  try {
    const { data } = await axiosInstance.post(`/crear/archivo/sigDocumento/${docId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.filePath;
  } catch (error) {
    console.error('Failed to upload document file:', error);
    throw new Error('No se pudo subir el archivo del documento.');
  }
};

/**
 * Fetches all documents for the authenticated user.
 * Only returns documents where the user is the creator and estado = true.
 * @param transversal - Optional parameter to filter transversal documents (admin only)
 * @returns Array of SigDocument objects.
 */
export const getDocuments = async (transversal?: boolean): Promise<SigDocument[]> => {
  try {
    const params = transversal !== undefined ? { transversal: transversal.toString() } : {};
    const { data } = await axiosInstance.get('/get/sigDocumento', { params });

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(mapApiDocumentToFrontend);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    throw new Error('No se pudieron obtener los documentos.');
  }
};

/**
 * Fetches all documents for admin approval (ADMIN-ONLY) with pagination.
 * By default, returns documents with status "Por revisar" or "Corregido".
 * Supports optional filters: fecha, estadoRevision, procesoId, page, limit.
 * @param filters - Optional filters for date, revision status ID, process ID, page, and limit.
 * @returns Paginated response with documents and pagination metadata.
 */
export const getDocumentsForApproval = async (filters?: {
  fecha?: string;
  estadoRevision?: number;
  procesoId?: number;
  page?: number;
  limit?: number;
}): Promise<{
  data: SigDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  try {
    const params = new URLSearchParams();

    if (filters?.fecha) {
      params.append('fecha', filters.fecha);
    }
    if (filters?.estadoRevision) {
      params.append('estadoRevision', filters.estadoRevision.toString());
    }
    if (filters?.procesoId) {
      params.append('procesoId', filters.procesoId.toString());
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const { data } = await axiosInstance.get('/get/sigDocumentoAprobacion', {
      params,
    });

    if (!data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format');
    }

    return {
      data: data.data.map(mapApiDocumentToFrontend),
      pagination: data.pagination,
    };
  } catch (error) {
    console.error('Failed to fetch documents for approval:', error);
    throw new Error('No se pudieron obtener los documentos para aprobación.');
  }
};

/**
 * Fetches all available document types.
 * @returns Array of DocumentType objects.
 */
export const getDocumentTypes = async (): Promise<DocumentType[]> => {
  try {
    const { data } = await axiosInstance.get('/get/tipoDocumento');

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch document types:', error);
    throw new Error('No se pudieron obtener los tipos de documento.');
  }
};

/**
 * Fetches all available revision statuses.
 * @returns Array of RevisionStatus objects.
 */
export const getRevisionStatuses = async (): Promise<RevisionStatus[]> => {
  try {
    const { data } = await axiosInstance.get('/get/estadoRevision');

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch revision statuses:', error);
    throw new Error('No se pudieron obtener los estados de revisión.');
  }
};

/**
 * Creates a new regular document and uploads its file.
 * The process is assigned from the user's session (backend).
 *
 * IMPORTANT: This is a TWO-STEP process that matches the backend implementation:
 * 1. POST /crear/sigDocumento - Creates the document record (process from user session)
 * 2. POST /crear/archivo/sigDocumento/:docId - Uploads the file and updates the document path
 *
 * The backend validates file types (PDF, Word, Excel) in the multer configuration.
 * If step 1 succeeds but step 2 fails, the document record will exist without a file,
 * and the user will need to resubmit the file using the "Reenviar" action.
 *
 * @param payload - Document creation data (código, descripción, versión, tipoDocumentoId).
 * @param file - The document file to upload (PDF, Word, or Excel).
 * @returns The created SigDocument with all related data populated.
 */
export const createDocument = async (
  payload: {
    codigo: string;
    descripcion: string;
    version: string;
    tipoDocumentoId: number;
    documentoAnteriorId?: number | null;
  },
  file: File
): Promise<SigDocument> => {
  let createdDocument: any = null;

  try {
    // Step 1: Create the document record (without file)
    // This calls the backend controller: createSigDocumentos
    // The process is taken from the user's session
    const createPayload = createDocumentPayload(payload);
    const { data } = await axiosInstance.post('/crear/sigDocumento', createPayload);
    createdDocument = data;

    // Step 2: Upload the file
    // This calls the backend controller: uploadDocumentoFile
    // The file is validated and stored in files/sigDocumento/{docId}/
    const filePath = await uploadFile(createdDocument.docId, file);

    // Update the local object with the file path
    createdDocument.docLinkDocumento = filePath;

    return mapApiDocumentToFrontend(createdDocument);
  } catch (error) {
    console.error('Failed to create document:', error);
    if (createdDocument) {
      throw new Error('El documento se creó pero falló la subida del archivo. Por favor, reintente subir el archivo.');
    } else {
      throw new Error('No se pudo crear el documento.');
    }
  }
};

/**
 * Creates a new transversal document and uploads its file (ADMIN ONLY).
 * Requires explicit process selection.
 *
 * IMPORTANT: This is a TWO-STEP process that matches the backend implementation:
 * 1. POST /crear/sigDocumento/transversal - Creates the transversal document record (admin only)
 * 2. POST /crear/archivo/sigDocumento/:docId - Uploads the file and updates the document path
 *
 * The backend validates file types (PDF, Word, Excel) in the multer configuration.
 * If step 1 succeeds but step 2 fails, the document record will exist without a file,
 * and the user will need to resubmit the file using the "Reenviar" action.
 *
 * @param payload - Document creation data (código, descripción, versión, tipoDocumentoId, procesoId).
 * @param file - The document file to upload (PDF, Word, or Excel).
 * @returns The created SigDocument with all related data populated.
 */
export const createTransversalDocument = async (
  payload: {
    codigo: string;
    descripcion: string;
    version: string;
    tipoDocumentoId: number;
    procesoId: number;
    documentoAnteriorId?: number | null;
  },
  file: File
): Promise<SigDocument> => {
  let createdDocument: any = null;

  try {
    // Step 1: Create the transversal document record (without file)
    // This calls the backend controller: createSigDocumentoTransversal
    const createPayload = createDocumentPayload(payload);
    const { data } = await axiosInstance.post('/crear/sigDocumento/transversal', createPayload);
    createdDocument = data;

    // Step 2: Upload the file
    // This calls the backend controller: uploadDocumentoFile
    // The file is validated and stored in files/sigDocumento/{docId}/
    const filePath = await uploadFile(createdDocument.docId, file);

    // Update the local object with the file path
    createdDocument.docLinkDocumento = filePath;

    return mapApiDocumentToFrontend(createdDocument);
  } catch (error) {
    console.error('Failed to create transversal document:', error);
    if (createdDocument) {
      throw new Error('El documento se creó pero falló la subida del archivo. Por favor, reintente subir el archivo.');
    } else {
      throw new Error('No se pudo crear el documento transversal.');
    }
  }
};

/**
 * Updates an existing document.
 * Optionally uploads a new file if provided.
 *
 * @param documentId - The ID of the document to update.
 * @param updates - Partial document data to update.
 * @param newFile - Optional new file to upload.
 * @returns The updated SigDocument.
 */
export const updateDocument = async (
  documentId: number | string,
  updates: Partial<SigDocument>,
  newFile?: File | null
): Promise<SigDocument> => {
  try {
    let fileUploadedDoc = null;

    // If there's a new file, upload it first
    if (newFile) {
      const formData = new FormData();
      formData.append('archivo', newFile);

      const { data: uploadResponse } = await axiosInstance.post(
        `/crear/archivo/sigDocumento/${documentId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // If the backend returns the updated document, use it
      if (uploadResponse.document) {
        fileUploadedDoc = mapApiDocumentToFrontend(uploadResponse.document);
      }
    }

    // If there are other updates besides the file, apply them
    if (Object.keys(updates).length > 0) {
      const payload = mapFrontendDocumentToUpdateApi(updates);
      const { data } = await axiosInstance.put(`/editar/sigDocumento/${documentId}`, payload);
      return mapApiDocumentToFrontend(data);
    }

    // If only file was uploaded, return the updated document from file upload
    if (fileUploadedDoc) {
      return fileUploadedDoc;
    }

    // If no updates were made, fetch the current document
    const { data } = await axiosInstance.get(`/get/sigDocumento`);
    const doc = Array.isArray(data) 
      ? data.find((d: any) => d.docId === documentId)
      : null;
    
    if (!doc) {
      throw new Error('Documento no encontrado después de la actualización');
    }
    
    return mapApiDocumentToFrontend(doc);
  } catch (error) {
    console.error('Failed to update document:', error);
    throw new Error('No se pudo actualizar el documento.');
  }
};

/**
 * Deletes a document (soft delete - sets docEstado to false).
 * @param documentId - The ID of the document to delete.
 */
export const deleteDocument = async (documentId: number | string): Promise<void> => {
  try {
    await axiosInstance.delete(`/delete/sigDocumento/${documentId}`);
  } catch (error) {
    console.error('Failed to delete document:', error);
    throw new Error('No se pudo eliminar el documento.');
  }
};

/**
 * Approves a document by updating its revision status to "Aprobado" (ID: 2).
 * @param documentId - The ID of the document to approve.
 * @returns The updated SigDocument.
 */
export const approveDocument = async (documentId: number | string): Promise<SigDocument> => {
  try {
    const { data } = await axiosInstance.put(`/editar/sigDocumento/${documentId}`, {
      sigEstadoRevision: 2
    });
    return mapApiDocumentToFrontend(data);
  } catch (error) {
    console.error('Failed to approve document:', error);
    throw new Error('No se pudo aprobar el documento.');
  }
};

/**
 * Rejects a document by updating its revision status to "Devuelto" (ID: 3).
 * @param documentId - The ID of the document to reject.
 * @returns The updated SigDocument.
 */
export const rejectDocument = async (
  documentId: number | string,
  observation?: string
): Promise<SigDocument> => {
  try {
    const payload = {
      sigEstadoRevision: 3,
      ...(observation ? { observacion: observation } : {})
    }
    const { data } = await axiosInstance.put(`/editar/sigDocumento/${documentId}`, payload);
    return mapApiDocumentToFrontend(data);
  } catch (error) {
    console.error('Failed to reject document:', error);
    throw new Error('No se pudo rechazar el documento.');
  }
};
