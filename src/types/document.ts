/**
 * Types for the SIG Document Management module
 */

// Document type (Manual, Procedure, etc.)
export interface DocumentType {
  tipId: number;
  tipNombre: string;
  tipSigla: string;
}

// Document revision status (Under Review, Approved, Returned, Corrected)
export interface RevisionStatus {
  edrId: number;
  edrNomEstado: string;
  edrDescripcion: string;
}

// SIG Process
export interface SigProcess {
  idProceso: number;
  nombre: string;
  objetivo: string;
  estado: boolean;
}

// User information (basic info about document creator)
export interface DocumentUser {
  idUsuario: number;
  nombreUsuario: string;
  contacto: string;
  nombreCompleto: string;
  usuEmailContacto: string;
  usuActivo: boolean;
  fechaCreacion: string;
  ultimoAcceso: string | null;
}

// Complete SIG document (API response with all relations populated)
export interface SigDocumentApi {
  docId: number;
  docCodigo: string;
  docDescripcion: string;
  docLinkDocumento: string;
  docVersion: string;
  docEstado: boolean;
  docCreado: string;
  docTransversal: boolean;
  docActualizadoEl: string;
  fkDocumentoAnterior: number | null;
  observacion: string | null;
  fkProceso: SigProcess;
  sigTipoDocumento: DocumentType;
  creadoPor: DocumentUser;
  sigEstadoRevision: RevisionStatus;
}

// SIG document for frontend (simplified and flattened structure for easier use in components)
export interface SigDocument {
  id: number;
  codigo: string;
  descripcion: string;
  fileUrl: string;
  version: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
  isTransversal: boolean;
  previousDocumentId: number | null;
  observation: string | null;

  // Simplified process relation
  processId: number;
  processName: string;

  // Simplified document type relation
  documentTypeId: number;
  documentTypeName: string;
  documentTypeSigla: string;

  // Simplified creator relation
  createdByUserId: number;
  createdByUserName: string;

  // Simplified revision status relation
  revisionStatusId: number;
  revisionStatusName: string;
}

// Payload for creating a document (without file - file is uploaded afterwards)
export interface CreateDocumentPayload {
  docCodigo: string;
  docDescripcion: string;
  docVersion: string;
  sigTipoDocumento: number;
  fkProceso?: number; // Only required for transversal documents (admin)
  fkDocumentoAnterior?: number | null;
}

// Payload for updating a document
export interface UpdateDocumentPayload {
  docCodigo?: string;
  docDescripcion?: string;
  docVersion?: string;
  sigTipoDocumento?: number;
  fkDocumentoAnterior?: number | null;
  sigEstadoRevision?: number;
  observacion?: string;
}
