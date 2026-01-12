import type {
  ContextMatrix,
  ApiContextMatrix,
  CreateContextMatrixPayload,
  ContextType,
  ApiContextType,
} from "@/types/organization-context";

/**
 * Maps API context type to frontend format
 * @param apiContextType - The API context type object
 * @returns ContextType object for frontend use
 */
export const mapApiContextTypeToFrontEnd = (
  apiContextType: ApiContextType,
): ContextType => ({
  id: apiContextType.id,
  name: apiContextType.contexto,
  active: apiContextType.activo,
});

/**
 * Maps API context matrix to frontend format
 * @param contextMatrix - The object in the form of ApiContextMatrix interface
 * @returns ContextMatrix object, matching the format expected by our front-end app
 */
export const mapApiContextMatrixToFrontEnd = (
  contextMatrix: ApiContextMatrix,
): ContextMatrix => ({
  id: contextMatrix.ctxId,
  description: contextMatrix.ctxDescripcion,
  document: contextMatrix.linkDocumento,
  status: contextMatrix.ctxEstado,
  active: contextMatrix.ctxActivo,
  fiscalYear: contextMatrix.ctxVigencia,
  createdAt: contextMatrix.ctxCreadoEl,
  type: mapApiContextTypeToFrontEnd(contextMatrix.ctxTipo),
});

/**
 * Maps frontend context matrix to API format
 * @param contextMatrix - The object in the form of contextMatrix interface
 * @returns ApiContextMatrix object, matching the format expected by the API
 */
export const mapContextMatrixToApi = (
  contextMatrix: ContextMatrix,
): ApiContextMatrix => ({
  ctxId: contextMatrix.id,
  ctxDescripcion: contextMatrix.description,
  linkDocumento: contextMatrix.document,
  ctxEstado: contextMatrix.status,
  ctxActivo: contextMatrix.active,
  ctxVigencia: contextMatrix.fiscalYear,
  ctxCreadoEl: contextMatrix.createdAt,
  ctxTipo: {
    id: contextMatrix.type.id,
    contexto: contextMatrix.type.name,
    activo: contextMatrix.type.active,
  },
});

/**
 * Maps frontend create payload to API format
 * @param contextMatrix - The create payload from frontend
 * @returns Object matching the API's expected format
 */
export const mapFrontEndCreatePayloadToApi = (
  contextMatrix: CreateContextMatrixPayload,
) => ({
  ctxDescripcion: contextMatrix.description,
  ctxTipo: contextMatrix.type,
});
